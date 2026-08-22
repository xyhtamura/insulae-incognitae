const STYLE_CONFIG = {
    global: {
        body: {
            h: 200,
            s: 5,
            l: 85,
            animate: {
                h: {
                    type: 'rotate',
                    speed: 0.1
                },
                l: {
                    min: 3,
                    max: 98,
                    speed: 0.045
                }
            }
        },
        terminal: {
            h: 190,
            s: 60,
            l: 92,
            animate: {
                h: {
                    type: 'rotate',
                    speed: 0.01
                },
                s: {
                    min: 15,
                    max: 62,
                    speed: 0.015
                },
                l: {
                    min: 40,
                    max: 93,
                    speed: 0.015
                }
            }
        }
    },
    terrain: {
        water: {
            textColor: {
                h: 199,
                s: 38,
                l: 74,
                animate: {
                    h: {
                        min: 165,
                        max: 245,
                        speed: 0.025
                    }
                }
            },
        },
        sand: {
            bgColor: {
                h: 45,
                s: 30,
                l: 61,
                animate: {
					h: {
						type: 'rotate',
						speed: 0.041
					},
                    s: {
                        min: 5,
                        max: 24,
                        speed: 0.02
                    },
                    l: {
                        min: 50,
                        max: 70,
                        speed: 0.028
                    }
                }
            }
        },
        grass: {
            textColor: {
                h: 25,
                s: 19,
                l: 21,
                animate: {
                    h: {
                        type: 'rotate',
                        speed: 0.055
                    },
                    s: {
                        min: 10,
                        max: 60,
                        speed: 0.02
                    },
                    l: {
                        min: 15,
                        max: 70,
                        speed: 0.03
                    }
                }
            },
            bgColor: {
                h: 110,
                s: 19,
                l: 35,
                animate: {
                    h: {
                        min: 60,
                        max: 128,
                        speed: 0.0108
                    },
                    s: {
                        min: 5,
                        max: 25,
                        speed: 0.026
                    },
                }
            }
        },
        forest: {
            textColor: {
                h: 137,
                s: 97,
                l: 22,
                animate: {
                    s: {
                        min: 20,
                        max: 98,
                        speed: 0.6
                    },
                    l: {
                        min: 3,
                        max: 35,
                        speed: 0.012
                    }
                }
            },
            bgColor: {
                h: 120,
                s: 30,
                l: 20,
                animate: {
                    s: {
                        min: 7,
                        max: 35,
                        speed: 0.011
                    },
                    l: {
                        min: 15,
                        max: 25,
                        speed: 0.021
                    }
                }
            }
        },
        mountain: {
            textColor: {
                h: 94,
                s: 32,
                l: 11,
                animate: {
                    h: {
                        min: 20,
                        max: 100,
                        speed: 0.0105
                    }
                }
            },
            bgColor: {
                h: 10,
                s: 10,
                l: 35,
                animate: {
                    h: {
                        type: 'rotate',
                        speed: 0.009
                    },
                    l: {
                        min: 10,
                        max: 60,
                        speed: 0.007
                    },
                    s: {
                        min: 5,
                        max: 25,
                        speed: 0.022
                    }
                }
            }
        }
    }
};

class BackgroundManager {
    constructor() {
        this.styles = STYLE_CONFIG;
        // Get a reference to the element where we will set the variables
        this.container = document.getElementById('terminal-content');

        // Initialize all the animation properties
        this.initializeProperties(this.styles.global);
        this.initializeProperties(this.styles.terrain);
    }
    
    // The initialize helpers are unchanged
    initializeProperties(styleObject) { for (const key in styleObject) { const style = styleObject[key]; if (style.textColor) this.initStyle(style.textColor); if (style.bgColor) this.initStyle(style.bgColor); if (style.animate) this.initStyle(style); } }
    initStyle(property) { property.current = { h: property.h, s: property.s, l: property.l }; for (const prop in property.animate) { property.animate[prop].direction = 1; } }

    update() {
        // --- 1. UPDATE & APPLY GLOBAL BACKGROUND STYLES ---
        this.animateProperty(this.styles.global.body);
        this.animateProperty(this.styles.global.terminal);
        const bodyStyle = this.styles.global.body.current;
        const termStyle1 = this.styles.global.terminal.current;
        const termStyle2 = { ...termStyle1, l: termStyle1.l - 2 };
        document.body.style.backgroundColor = `hsl(${bodyStyle.h}, ${bodyStyle.s}%, ${bodyStyle.l}%)`;
        document.getElementById('terminal').style.backgroundImage = `linear-gradient(hsl(${termStyle1.h}, ${termStyle1.s}%, ${termStyle1.l}%), hsl(${termStyle2.h}, ${termStyle2.s}%, ${termStyle2.l}%))`;

        // --- 2. UPDATE CSS VARIABLES FOR TERRAIN STYLES ---
        for (const className in this.styles.terrain) {
            const style = this.styles.terrain[className];
            
            if (style.textColor) {
                this.animateProperty(style.textColor);
                const tc = style.textColor.current;
                // Set the CSS variable for this class's text color
                this.container.style.setProperty(`--${className}-text-color`, `hsl(${tc.h}, ${tc.s}%, ${tc.l}%)`);
            } else {
                this.container.style.setProperty(`--${className}-text-color`, 'transparent');
            }

            if (style.bgColor) {
                this.animateProperty(style.bgColor);
                const bg = style.bgColor.current;
                // Set the CSS variable for this class's background color
                this.container.style.setProperty(`--${className}-bg-color`, `hsl(${bg.h}, ${bg.s}%, ${bg.l}%)`);
            } else {
                this.container.style.setProperty(`--${className}-bg-color`, 'transparent');
            }
        }
    }

    animateProperty(property) {
        if (!property || !property.animate) return;
        for (const prop in property.animate) {
            const anim = property.animate[prop];

            if (anim.type === 'rotate') {
                property.current[prop] = (property.current[prop] + anim.speed) % 360;
            } else {
                property.current[prop] += anim.speed * anim.direction;
                if (property.current[prop] > anim.max || property.current[prop] < anim.min) {
                    anim.direction *= -1;
                }
            }
        }
    }
}