import * as THREE from 'three';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';

const CustomHalftoneShader = {
    uniforms: {
        'tDiffuse': { value: null }, 'shape': { value: 1 }, 'radius': { value: 4 },
        'rotateR': { value: Math.PI / 12 * 1 }, 'rotateG': { value: Math.PI / 12 * 2 }, 'rotateB': { value: Math.PI / 12 * 3 },
        'scatter': { value: 0 }, 'width': { value: 1 }, 'height': { value: 1 },
        'greyscale': { value: false }, 'useAverageColor': { value: false }, 'customColor': { value: new THREE.Color(0x000000) }
    },
    vertexShader: `varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 ); }`,
    fragmentShader: `
        uniform sampler2D tDiffuse; uniform float radius; uniform float rotateR; uniform float rotateG;
        uniform float rotateB; uniform float scatter; uniform float width; uniform float height;
        uniform bool greyscale; uniform bool useAverageColor; uniform vec3 customColor; uniform int shape;
        varying vec2 vUv;
        vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
        vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
        vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }
        float snoise(vec2 v) {
            const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
            vec2 i  = floor(v + dot(v, C.yy) ); vec2 x0 = v - i + dot(i, C.xx);
            vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
            vec4 x12 = x0.xyxy + C.xxzz; x12.xy -= i1; i = mod289(i);
            vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 )) + i.x + vec3(0.0, i1.x, 1.0 ));
            vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
            m = m*m; m = m*m;
            vec3 x = 2.0 * fract(p * C.www) - 1.0; vec3 h = abs(x) - 0.5; vec3 ox = floor(x + 0.5); vec3 a0 = x - ox;
            m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
            vec3 g; g.x  = a0.x  * x0.x  + h.x  * x0.y; g.yz = a0.yz * x12.xz + h.yz * x12.yw;
            return 130.0 * dot(m, g);
        }
        float pattern(int shape, vec2 U, float angle, float R) {
            float s = sin(angle), c = cos(angle); vec2 tex = U;
            tex.x = dot(U, vec2(c, -s)); tex.y = dot(U, vec2(s, c));
            tex = fract(tex * R);
            if (shape == 5) { float d1 = abs(tex.x - tex.y); float d2 = abs(tex.x + tex.y - 1.0); return min(d1, d2) * 2.0; }
            if (shape == 4) { return max(abs(tex.x - 0.5), abs(tex.y - 0.5)); }
            if (shape == 3) { return abs(tex.y - 0.5); }
            if (shape == 2) { tex.x *= 0.5; return length(tex - 0.5); }
            return length(tex - 0.5);
        }
        void main() {
            vec2 screenPos = gl_FragCoord.xy / vec2(width, height);
            vec3 C = texture2D(tDiffuse, vUv).rgb;
            float scatter_val = snoise(screenPos * 200.0) * scatter;
            if (greyscale) { C = vec3(dot(C, vec3(0.299, 0.587, 0.114))); }
            float R = pattern(shape, screenPos, rotateR + scatter_val, radius);
            float G = pattern(shape, screenPos, rotateG + scatter_val, radius);
            float B = pattern(shape, screenPos, rotateB + scatter_val, radius);
            vec3 blend_color = useAverageColor ? (C * 0.7) : customColor;
            vec3 color = mix(C, blend_color, step(C, vec3(R, G, B)));
            gl_FragColor = vec4(color, 1.0);
        }`
};

export class CustomHalftonePass extends ShaderPass {
    constructor(width, height, params) {
        super(CustomHalftoneShader);
        this.uniforms.width.value = width;
        this.uniforms.height.value = height;
        for (const key in params) {
            if (Object.prototype.hasOwnProperty.call(params, key) && Object.prototype.hasOwnProperty.call(this.uniforms, key)) {
                this.uniforms[key].value = params[key];
            }
        }
    }
}