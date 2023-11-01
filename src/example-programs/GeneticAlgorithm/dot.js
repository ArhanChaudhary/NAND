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
    static #obstacles;

    static config(initialX, initialY, goalX, goalY, brainSize, obstacles) {
        Dot.#initialX = initialX;
        Dot.#initialY = initialY;
        Dot.#goalX = goalX;
        Dot.#goalY = goalY;
        Dot.#brainSize = brainSize;
        Dot.#minStep = 32767;
        Dot.#stepWeight = Math.trunc((32767 - 10000) / Brain.getBrainSize());
        Dot.#obstacles = obstacles;
    }

    constructor() {
        this.#brain = new Brain();
        this.instantiate();
    }

    instantiate() {
        this.#dead = false;
        this.#reachedGoal = false;
        this.#prevX = Dot.#initialX;
        this.#prevY = Dot.#initialY;

        this.#posX = Dot.#initialX;
        this.#posY = Dot.#initialY;
        this.#velX = 0;
        this.#velY = 0;
        this.#acc = null;
    }

    getDead() {
        return this.#dead;
    }

    static getMinStep() {
        return Dot.#minStep;
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
            Util.drawRect(this.#prevX, this.#prevY, this.#prevX + 2, this.#prevY + 2);
            ctx.fillStyle = 'black';
            this.#prevX = this.#posX - 1;
            this.#prevY = this.#posY - 1;
            Util.drawRect(this.#prevX, this.#prevY, this.#prevX + 2, this.#prevY + 2);
        }
    }

    update() {
        let tmp;
        let tmp2;
        if (!(this.#brain.getStep() > Dot.#minStep)) {
            if (!this.#dead) {
                if (!(Dot.#brainSize > this.#brain.getStep())) {
                    this.#dead = true;
                } else {
                    this.#acc = this.#brain.getNextDirection();
                }

                this.#velX += this.#acc.getX();
                this.#velY += this.#acc.getY();
                tmp = this.#velX < 0;
                tmp2 = this.#velY < 0;

                if (tmp) {
                    this.#velX = -this.#velX;
                }

                if (tmp2) {
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

                if (tmp) {
                    this.#velX = -this.#velX;
                }

                if (tmp2) {
                    this.#velY = -this.#velY;
                }

                this.#posX += this.#velX;
                this.#posY += this.#velY;

                tmp = 0;
                tmp2 = this.#posY;
                while (!(tmp2 < 16)) {
                    tmp2 -= 16;
                    tmp += 32;
                }
                // tmp should be (tmp2 / 16) * 32

                tmp2 = this.#posX;
                while (!(tmp2 < 16)) {
                    tmp2 -= 16;
                    tmp++;
                }
                // tmp should be (tmp2 / 16) * 32 + (tmp / 16)

                if (!(this.#posX < 2 || this.#posY < 2 || this.#posX > 510 || this.#posY > 254 || Dot.#obstacles[tmp])) {
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
        let distSquared;
        let dynamicStepWeight;
        if (!this.#reachedGoal) {
            x = Math.trunc(Math.abs(this.#posX - Dot.#goalX) / 4);
            y = Math.trunc(Math.abs(this.#posY - Dot.#goalY) / 4);
            distSquared = Math.max(10, x * x + y * y);
            dynamicStepWeight = Math.max(1, 25 - Math.trunc(distSquared / 300));
            return Math.trunc(32767 / distSquared) + (dynamicStepWeight - Math.trunc(this.#brain.getStep() / Math.trunc(Dot.#brainSize / dynamicStepWeight)));
            // x = Math.trunc(Math.abs(this.#posX - Dot.#goalX) / 2);
            // y = Math.trunc(Math.abs(this.#posY - Dot.#goalY) / 2);
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