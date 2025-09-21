import * as THREE from 'three';

export const DECK_LAYER = 0;
export const PRESENTED_CARD_LAYER = 1;
export const CARD_GEOMETRY = new THREE.PlaneGeometry(2.5, 4.3);

export const CARD_DATA = [
    { title: 'The Fool', number: 0, fileName: '00-TheFool', description: 'Represents new beginnings, faith in the future, being inexperienced, not knowing what to expect, having beginner\'s luck, improvisation and believing in the universe.' },
    { title: 'The Magician', number: 1, fileName: '01-TheMagician', description: 'Represents willpower, desire, creation, and manifestation. The power to turn visions into reality.' },
    { title: 'The Emperor', number: 4, fileName: '04-TheEmperor', description: 'Represents authority, structure, control, and fatherly energy. A symbol of leadership and worldly power.' },
    { title: 'The Chariot', number: 7, fileName: '07-TheChariot', description: 'Represents victory, assertion, and control over opposing forces through strength of will.' },
    { title: 'Wheel of Fortune', number: 10, fileName: '10-WheelOfFortune', description: 'Represents destiny, cycles, fate, and turning points. A reminder that life is ever-changing.' },
    { title: 'The Hanged Man', number: 12, fileName: '12-TheHangedMan', description: 'Represents suspension, new perspectives, and sacrifice. Finding wisdom in surrender.' },
].map(card => {
    // Paths are now relative to the domain root, served by Flask from the 'static' folder
    card.imageUrl = `/static/images/${card.fileName}.jpg`;
    card.normalUrl = `/static/normals/${card.fileName}.jpg`;
    return card;
});

const SETTINGS = {
    "scene": {
        "backgroundColor1": "#dbd0c3",
        "backgroundColor2": "#661c1c",
        "gradientSharpness": 0.6804
    },
    "typography": {
        "fontLink": "",
        "position": 6,
        "horizontalPosition": 0,
        "title": {
            "fontFamily": "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
            "size": 4,
            "minSize": 1.8,
            "maxSize": 2.8,
            "color": "#26160d",
            "weight": "600",
            "letterSpacing": 0,
            "transform": "none"
        },
        "subtitle": {
            "fontFamily": "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
            "size": 1.5,
            "minSize": 0.7,
            "maxSize": 0.9,
            "color": "#26160d",
            "weight": "400",
            "letterSpacing": 0,
            "transform": "none"
        },
        "cta": {
            "fontFamily": "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
            "size": 2,
            "minSize": 0.9,
            "maxSize": 1.2,
            "color": "#26160d",
            "weight": "700",
            "letterSpacing": 0.5,
            "transform": "uppercase"
        }
    },
    "camera": {
        "fov": 56.32,
        "position": {
            "x": 0,
            "y": 1.5,
            "z": 12
        }
    },
    "lighting": {
        "ambient": {
            "color": "#ffffff",
            "intensity": 0.14
        },
        "spotlight": {
            "showGuide": true,
            "color": "#FFEEDD",
            "intensity": 54,
            "angle": 0.1855,
            "penumbra": 0.8511,
            "decay": 1,
            "position": {
                "x": 0.16,
                "y": 6.06,
                "z": 30
            },
            "target": {
                "x": 0,
                "y": 0,
                "z": 0
            }
        },
        "presentLight": {
            "color": "#ffffff",
            "intensity": 2.5,
            "distance": 10,
            "decay": 1,
            "offset": {
                "x": 0,
                "y": 0,
                "z": 2
            }
        },
        "rimLight": {
            "enabled": false,
            "showGuide": true,
            "color": "#aaddff",
            "intensity": 0,
            "position": {
                "x": 0,
                "y": 5,
                "z": -10
            },
            "target": {
                "x": 0,
                "y": 0,
                "z": 0
            }
        }
    },
    "shadows": {
        "enabled": true,
        "planeSize": 25,
        "planeOpacity": 0,
        "planeY": -5,
        "bias": -0.001,
        "normalBias": -0.027,
        "mapSize": 1024
    },
    "orbit": {
        "position": {
            "x": 0,
            "y": 4.8,
            "z": 0
        },
        "rotation": {
            "x": 46.8,
            "y": 33.48,
            "z": 0
        },
        "panRangeLeft": 75.24,
        "panRangeRight": 0
    },
    "cardLayout": {
        "radius": 7,
        "arc": 78,
        "pitch": -90,
        "yaw": 3,
        "roll": 0,
        "spacing": 0.1,
        "skew": {
            "x": 0,
            "y": 0
        },
        "jitter": {
            "position": 0.08,
            "rotation": 0
        }
    },
    "cardMaterial": {
        "useNormalMap": true,
        "roughness": 0.181,
        "metalness": 0,
        "normalScale": {
            "x": 1,
            "y": 2.19
        },
        "emissive": "#000000",
        "emissiveIntensity": 1
    },
    "interaction": {
        "friction": 0.95,
        "hoverScale": 1.05,
        "clickThreshold": 10,
        "dimFactor": 0.2,
        "panEdgeRatio": 0.15,
        "panEdgeSpeed": 0.015,
        "parallaxFactor": 0.05
    },
    "animation": {
        "present": {
            "offset": {
                "x": 0,
                "y": -0.75,
                "z": 0
            },
            "pullDuration": 0.3,
            "pullEase": "power1.in",
            "travelDuration": 0.8,
            "travelEase": "power3.out",
            "scaleDuration": 0.96,
            "scaleEase": "back.out(1.4)"
        },
        "dismiss": {
            "offset": {
                "x": -1.5,
                "y": 0,
                "z": 0
            },
            "travelDuration": 0.5,
            "travelEase": "power2.inOut",
            "slideDuration": 0.3,
            "slideEase": "power1.out"
        }
    },
    "presentState": {
        "position": {
            "x": 0,
            "y": 0.71,
            "z": 5.121
        },
        "rotation": {
            "x": 0,
            "y": 180,
            "z": 0
        },
        "scale": 1.1571,
        "verticalMargin": 0.1
    },
    "postProcessing": {
        "film": {
            "enabled": false,
            "noiseIntensity": 0,
            "scanlineIntensity": 0,
            "scanlineCount": 0
        },
        "rgbShift": {
            "enabled": false,
            "amount": 0,
            "angle": 0
        },
        "vignette": {
            "enabled": true,
            "offset": 0.772,
            "darkness": 1.054
        },
        "smaa": {
            "enabled": true
        },
        "dof": {
            "enabled": true,
            "focus": 0,
            "aperture": 0,
            "maxblur": 0
        },
        "halftone": {
            "enabled": true,
            "backgroundOnly": false,
            "shape": 1,
            "radius": 116.883,
            "rotateR": 15,
            "rotateG": 30,
            "rotateB": 45,
            "scatter": 0,
            "greyscale": false,
            "useAverageColor": true,
            "customColor": "#ff0000"
        },
        "colorCorrection": {
            "enabled": false,
            "powRGB": {
                "x": 2,
                "y": 2,
                "z": 2
            },
            "mulRGB": {
                "x": 1,
                "y": 1,
                "z": 1
            },
            "addRGB": {
                "x": 0,
                "y": 0,
                "z": 0
            }
        },
        "sepia": {
            "enabled": false,
            "amount": 1
        },
        "afterimage": {
            "enabled": false,
            "damp": 0.8
        }
    }
};