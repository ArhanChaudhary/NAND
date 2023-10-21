import Brain from "./brain.js";
import Util, { ctx } from "./util.js";

export default class Dot {
    static #initialX;
    static #initialY;
    #posX;
    #posY;
    #velX;
    #velY;
    #acc;
    static #goalX;
    static #goalY;
    #prevX;
    #prevY;
    #brain;
    #dead;
    #reachedGoal;
    static #stepWeight;
    static #brainSize;
    static #minStep;

    static init(initialX, initialY, goalX, goalY, brainSize) {
        Dot.#initialX = initialX;
        Dot.#initialY = initialY;
        Dot.#goalX = goalX;
        Dot.#goalY = goalY;
        Dot.#brainSize = brainSize;
        Dot.#minStep = 32767;
        Dot.#stepWeight = Math.floor((32767 - 10000) / Brain.getBrainSize());
    }

    constructor(brain) {
        this.#brain = brain;
        this.instantiate();
    }

    instantiate() {
        this.#dead = false;
        this.#reachedGoal = false;
        this.#prevX = 0;
        this.#prevY = 0;

        this.#posX = initialX;
        this.#posY = initialY;
        this.#velX = 0;
        this.#velY = 0;
        this.#acc = null;
    }

    getDead() {
        return this.#dead;
    }

    static setMinStep(minStep) {
        Dot.#minStep = minStep;
    }

    getBrain() {
        return this.#brain;
    }

    setBrain(brain) {
        this.#brain = brain;
    }

    getReachedGoal() {
        return this.#reachedGoal;
    }

    show() {
        if (!this.#dead) {
            ctx.fillStyle = 'white';
            Util.drawRect(this.#prevX, this.#prevY, 2, 2);
            ctx.fillStyle = 'black';
            this.#prevX = this.#posX - 1;
            this.#prevY = this.#posY - 1;
            Util.drawRect(this.#prevX, this.#prevY, 2, 2);
        }
    }

    update() {
        let newVelXIsNegative;
        let newVelYIsNegative;
        if (!(this.#brain.getStep() > Dot.#minStep)) {
            if (!this.#dead) {
                if (!(Dot.#brainSize > this.#brain.getStep())) {
                    this.#dead = true;
                } else {
                    this.#acc = this.#brain.getNextDirection();
                }

                this.#velX += this.#acc.getX();
                this.#velY += this.#acc.getY();
                newVelXIsNegative = this.#velX < 0;
                newVelYIsNegative = this.#velY < 0;

                if (newVelXIsNegative) {
                    this.#velX = -this.#velX;
                }

                if (newVelYIsNegative) {
                    this.#velY = -this.#velY;
                }

                if (!(this.#velX > 5)) {
                    if (!(this.#velX === 4)) {
                        if (!(this.#velX === 0)) {
                            if (!(this.#velY < 5)) {
                                this.#velY = 4;
                            }
                        } else if (!(this.#velY < 6)) {
                            this.#velY = 5;
                        }
                    } else if (!(this.#velY < 4)) {
                        this.#velY = 3;
                    }
                } else {
                    this.#velX = 5;
                    this.#velY = 0;
                }

                if (newVelXIsNegative) {
                    this.#velX = -this.#velX;
                }
                if (newVelYIsNegative) {
                    this.#velY = -this.#velY;
                }

                this.#posX += this.#velX;
                this.#posY += this.#velY;

                if (!(this.#posX < 2 || this.#posY < 2 || this.#posX > 510 || this.#posY > 254)) {
                    if (!(Math.abs(this.#posX - Dot.#goalX) > 3 || Math.abs(this.#posY - Dot.#goalY) > 3)) {
                        this.#reachedGoal = true;
                        this.#dead = true;
                    }
                } else {
                    this.#dead = true;
                }
            }
        } else {
            this.#dead = true;
        }
    }

    calculateFitness() {
        let x;
        let y;
        if (!this.#reachedGoal) {
            x = Math.floor(Math.abs(this.#posX - Dot.#goalX) / 4);
            y = Math.floor(Math.abs(this.#posY - Dot.#goalY) / 4);
            return Math.floor(32767 / Math.max(10, x * x + y * y));
            // x = Math.floor(Math.abs(this.#posX - Dot.#goalX) / 2);
            // y = Math.floor(Math.abs(this.#posY - Dot.#goalY) / 2);
            // dist = x * x;
            // if (dist < 0) {
            //     switchToNewton = true;
            // } else {
            //     tmp = y * y;
            //     if (tmp < 0) {
            //         switchToNewton = true;
            //     } else {
            //         switchToNewton = (dist > 16384) || (tmp > 16384);
            //     }
            // }
            // if (switchToNewton) {
            //     dist = x + y - x * y / (x + y);
            //     return (32767 / dist) / dist;
            // }
            // return 32767 / (dist + tmp);
        }
        return Math.max(10000, 32767 - Dot.#stepWeight * this.#brain.getStep());
    }
}