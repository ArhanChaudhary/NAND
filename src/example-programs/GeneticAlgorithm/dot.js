import Brain from "./brain.js";
import Util from "./util.js";
import Main from "./main.js";

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
        this.#dead = 0;
        this.#reachedGoal = 0;
        this.#prevX = Dot.#initialX - 1;
        this.#prevY = Dot.#initialY - 1;

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

    update(andShow) {
        let newVelXIsNegative;
        let newVelYIsNegative;
        if (!(this.#brain.getStep() > Dot.#minStep)) {
            if (!this.#dead) {
                if (!(Dot.#brainSize > this.#brain.getStep())) {
                    this.#dead = -1;
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
                    if (!(this.#velX == 4)) {
                        if (!(this.#velX == 0)) {
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

                if (!(this.#posX < 2 || this.#posY < 2 || this.#posX > 510 || this.#posY > 254 || Dot.#obstacles[Main.getGridIndex(this.#posX, this.#posY)] == -1)) {
                    if (!(Math.abs(this.#posX - Dot.#goalX) > 3 || Math.abs(this.#posY - Dot.#goalY) > 3)) {
                        this.#reachedGoal = -1;
                        this.#dead = -1;
                    }
                } else {
                    this.#dead = -1;
                }
            }
        } else {
            this.#dead = -1;
        }

        if (!andShow) {
            // needs to be here since calculateFitness uses prevX and prevY
            this.#prevX = this.#posX - 1;
            this.#prevY = this.#posY - 1;
        } else if (!this.#dead) {
            Util.setColor(0);
            Util.drawRectangle(this.#prevX, this.#prevY, this.#prevX + 2, this.#prevY + 2);
            Util.setColor(-1);
            this.#prevX = this.#posX - 1;
            this.#prevY = this.#posY - 1;
            Util.drawRectangle(this.#prevX, this.#prevY, this.#prevX + 2, this.#prevY + 2);
        }
    }

    calculateFitness() {
        if (!this.#reachedGoal) {
            // needed if goal is blocked off completely and the current grid index hasnt been flooded (is 0)
            return Math.max(1, Dot.#obstacles[Main.getGridIndex(this.#prevX + 1, this.#prevY + 1)]);
        }
        return Math.max(10000, 32767 - Dot.#stepWeight * this.#brain.getStep());
    }
}