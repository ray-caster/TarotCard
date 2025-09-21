import * as THREE from 'three';
import { gsap } from 'gsap';
import { SETTINGS, DECK_LAYER, PRESENTED_CARD_LAYER, CARD_GEOMETRY } from './config.js';

export class UIManager {
    constructor() {
        this.headerTitle = document.querySelector('.header-title');
        this.dismissButton = document.getElementById('dismiss-button');
        this.arrowLeft = document.getElementById('arrow-left');
        this.arrowRight = document.getElementById('arrow-right');
    }
    showCardSelectionUI() {
        this.headerTitle.classList.remove('is-hidden');
        this.dismissButton.classList.remove('is-visible');
        this.arrowLeft.classList.remove('visible');
        this.arrowRight.classList.remove('visible');
    }
    showCardPresentationUI() {
        this.headerTitle.classList.add('is-hidden');
        this.dismissButton.classList.add('is-visible');
        this.arrowLeft.classList.add('visible');
        this.arrowRight.classList.add('visible');
    }
    setCursor(cursorStyle) { document.body.style.cursor = cursorStyle; }
}

export class FiniteStateMachine {
    constructor(initialState = 'LOADING') {
        this.currentState = initialState;
        const transitions = { LOADING: ['IDLE'], IDLE: ['PRESENTING', 'DISMISSING'], PRESENTING: ['PRESENTED'], PRESENTED: ['DISMISSING', 'SWITCHING'], DISMISSING: ['IDLE'], SWITCHING: ['PRESENTED'] };
        this.canTransitionTo = (newState) => transitions[this.currentState]?.includes(newState) ?? false;
        this.transitionTo = (newState) => {
            if (this.canTransitionTo(newState)) {
                this.currentState = newState;
                return true;
            }
            console.warn(`Invalid state transition from ${this.currentState} to ${newState}`);
            return false;
        }
    }
}

export class AnimationController {
    constructor(scene, camera, cards, presentLight, shadowPlane, spotLight) {
        this.scene = scene;
        this.camera = camera;
        this.cards = cards;
        this.presentedCard = null;
        this.presentLight = presentLight;
        this.shadowPlane = shadowPlane;
        this.spotLight = spotLight;
    }
    present(card) {
        this.presentedCard = card;
        const animSettings = SETTINGS.animation.present;
        return new Promise(resolve => {
            gsap.killTweensOf([card.position, card.quaternion, card.scale]);
            card.traverse(child => { child.layers.set(PRESENTED_CARD_LAYER); });
            this.shadowPlane.visible = false;
            this.spotLight.castShadow = false;
            card.renderOrder = 999;
            const flightMaterialProps = { depthTest: false, roughness: 1.0, receiveShadow: false, };
            const finalTransform = this.calculatePresentedCardTransform();
            const lightOffset = SETTINGS.lighting.presentLight.offset;
            this.presentLight.position.copy(finalTransform.position).add(new THREE.Vector3(lightOffset.x, lightOffset.y, lightOffset.z));
            gsap.to(this.presentLight, { intensity: SETTINGS.lighting.presentLight.intensity, duration: 0.5, ease: 'power2.out' });
            this.scene.attach(card);
            const masterTl = gsap.timeline({ onComplete: resolve });
            const localOffset = new THREE.Vector3(animSettings.offset.x, animSettings.offset.y, animSettings.offset.z);
            const worldOffset = localOffset.clone().applyQuaternion(card.quaternion);
            const intermediatePosition = card.position.clone().add(worldOffset);
            const pullOutTl = gsap.timeline().to(card.position, { ...intermediatePosition, duration: animSettings.pullDuration, ease: animSettings.pullEase });
            const travelTl = gsap.timeline();
            travelTl.to(card.position, { ...finalTransform.position, duration: animSettings.travelDuration, ease: animSettings.travelEase }, 0);
            travelTl.to(card.quaternion, { _x: finalTransform.quaternion.x, _y: finalTransform.quaternion.y, _z: finalTransform.quaternion.z, _w: finalTransform.quaternion.w, duration: animSettings.travelDuration, ease: animSettings.travelEase }, 0);
            travelTl.to(card.scale, { ...finalTransform.scale, duration: animSettings.scaleDuration, ease: animSettings.scaleEase }, 0);
            masterTl.add(pullOutTl).call(() => {
                card.traverse(child => { if (child.isMesh) { Object.assign(child.material, flightMaterialProps); child.material.needsUpdate = true; } });
                this.dimOtherCards(card, true);
            }).add(travelTl).play();
        });
    }
    dismiss(card) {
        return new Promise(resolve => {
            this.dimOtherCards(card, false);
            gsap.to(this.presentLight, { intensity: 0, duration: 0.5, ease: 'power2.in' });
            const tl = this.getDismissAnimation(card);
            tl.eventCallback('onComplete', () => {
                card.traverse(child => { child.layers.set(DECK_LAYER); });
                if (this.presentedCard === card) this.presentedCard = null;
                resolve();
            }).play();
        });
    }
    calculatePresentedCardTransform() {
        const { position, rotation, scale, verticalMargin } = SETTINGS.presentState;
        const finalPosition = new THREE.Vector3(position.x, position.y, this.camera.position.z - position.z);
        const cardDistance = Math.abs(finalPosition.z - this.camera.position.z);
        const vFOV = THREE.MathUtils.degToRad(this.camera.fov);
        const visibleHeightAtDistance = 2 * Math.tan(vFOV / 2) * cardDistance;
        const desiredCardHeight = visibleHeightAtDistance * (1 - (verticalMargin * 2));
        const finalScaleVal = (desiredCardHeight / CARD_GEOMETRY.parameters.height) * scale;
        const finalScale = { x: finalScaleVal, y: finalScaleVal, z: finalScaleVal };
        const finalRotation = new THREE.Euler(THREE.MathUtils.degToRad(rotation.x), THREE.MathUtils.degToRad(rotation.y), THREE.MathUtils.degToRad(rotation.z), 'XYZ');
        const finalQuaternion = new THREE.Quaternion().setFromEuler(finalRotation);
        return { position: finalPosition, quaternion: finalQuaternion, scale: finalScale };
    }
    getDismissAnimation(card) {
        const tl = gsap.timeline({ paused: true });
        const animSettings = SETTINGS.animation.dismiss;
        gsap.killTweensOf([card.position, card.quaternion, card.scale]);
        const orbitGroup = this.scene.getObjectByName('orbitGroup');
        const helper = new THREE.Object3D();
        orbitGroup.add(helper);
        helper.position.copy(card.userData.initialPosition);
        helper.quaternion.copy(card.userData.initialQuaternion);
        const finalWorldPosition = helper.getWorldPosition(new THREE.Vector3());
        const finalWorldQuaternion = helper.getWorldQuaternion(new THREE.Quaternion());
        orbitGroup.remove(helper);
        const localOffset = new THREE.Vector3(animSettings.offset.x, animSettings.offset.y, animSettings.offset.z);
        const worldOffset = localOffset.clone().applyQuaternion(finalWorldQuaternion);
        const intermediatePosition = finalWorldPosition.clone().add(worldOffset);
        tl.to(card.position, { ...intermediatePosition, duration: animSettings.travelDuration, ease: animSettings.travelEase }, 0);
        tl.to(card.quaternion, { _x: finalWorldQuaternion.x, _y: finalWorldQuaternion.y, _z: finalWorldQuaternion.z, _w: finalWorldQuaternion.w, duration: animSettings.travelDuration, ease: animSettings.travelEase }, 0);
        tl.to(card.scale, { x: 1, y: 1, z: 1, duration: animSettings.travelDuration, ease: animSettings.travelEase }, 0);
        tl.call(() => { card.renderOrder = 0; card.traverse(child => { if (child.isMesh) { child.material.depthTest = true; child.material.needsUpdate = true; } }); });
        tl.to(card.position, { ...finalWorldPosition, duration: animSettings.slideDuration, ease: animSettings.slideEase });
        tl.call(() => {
            orbitGroup.attach(card);
            card.position.copy(card.userData.initialPosition);
            card.quaternion.copy(card.userData.initialQuaternion);
            card.scale.set(1, 1, 1);
            this.shadowPlane.visible = SETTINGS.shadows.enabled;
            this.spotLight.castShadow = SETTINGS.shadows.enabled;
            card.traverse(child => { if (child.isMesh) { child.material.roughness = SETTINGS.cardMaterial.roughness; child.receiveShadow = true; child.material.needsUpdate = true; } });
        });
        return tl;
    }
    dimOtherCards(presentedCard, isDimming) {
        const dim = SETTINGS.interaction.dimFactor;
        this.cards.forEach(card => {
            if (card !== presentedCard) {
                card.traverse(child => {
                    if (child.isMesh) {
                        gsap.to(child.material.color, { r: isDimming ? dim : 1, g: isDimming ? dim : 1, b: isDimming ? dim : 1, duration: 0.5 });
                    }
                });
            }
        });
    }
    updatePresentedCardTransform() {
        if (!this.presentedCard) return;
        const newTransform = this.calculatePresentedCardTransform();
        const lightOffset = SETTINGS.lighting.presentLight.offset;
        this.presentLight.position.copy(newTransform.position).add(new THREE.Vector3(lightOffset.x, lightOffset.y, lightOffset.z));
        const d = 0.5, e = 'power2.out';
        gsap.to(this.presentedCard.position, { ...newTransform.position, duration: d, ease: e });
        if (SETTINGS.interaction.parallaxFactor <= 0) {
            gsap.to(this.presentedCard.quaternion, { _x: newTransform.quaternion.x, _y: newTransform.quaternion.y, _z: newTransform.quaternion.z, _w: newTransform.quaternion.w, duration: d, ease: e });
        }
        gsap.to(this.presentedCard.scale, { ...newTransform.scale, duration: d, ease: e });
    }
}