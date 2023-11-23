import Brain from "./brain.js";
import Util from "./util.js";
import Main from "./main.js";

const div = Util.div;
const gt = Util.gt;
const neg = Util.neg;
const not = Util.not;
const add = Util.add;
const lt = Util.lt;
const eq = Util.eq;
const abs = Util.abs;
const sub = Util.sub;
const max = Util.max;
const mult = Util.mult;
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
        Dot.#stepWeight = div(22767, Brain.getBrainSize());
        Dot.#obstacles = obstacles;
    }

    constructor() {
        this.#brain = new Brain();
        this.instantiate();
    }

    instantiate() {
        this.#dead = 0;
        this.#reachedGoal = 0;
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

    update(andShow, firstPairComponent) {
        let newVelXIsNegative;
        let newVelYIsNegative;
        if (eq(this.#brain.getStep(), Dot.#minStep)) {
            this.#dead = neg(1);
        } else if (not(this.#dead)) {
            if (eq(this.#brain.getStep(), Dot.#brainSize)) {
                this.#dead = neg(1);
            } else if (firstPairComponent) {
                this.#acc = this.#brain.getNextDirection();
            } else {
                this.#brain.incStep();
            }

            if (firstPairComponent) {
                this.#velX = add(this.#velX, this.#acc.getX());
                this.#velY = add(this.#velY, this.#acc.getY());
            } else {
                this.#velX = add(this.#velX, this.#acc.getX2());
                this.#velY = add(this.#velY, this.#acc.getY2());
            }

            newVelXIsNegative = lt(this.#velX, 0);
            newVelYIsNegative = lt(this.#velY, 0);

            if (newVelXIsNegative) {
                this.#velX = neg(this.#velX);
            }

            if (newVelYIsNegative) {
                this.#velY = neg(this.#velY);
            }

            if (gt(this.#velX, 5)) {
                this.#velX = 5;
                this.#velY = 0;
            } else if (eq(this.#velX, 4)) {
                if (gt(this.#velY, 3)) {
                    this.#velY = 3;
                }
            } else if (eq(this.#velX, 0)) {
                if (gt(this.#velY, 5)) {
                    this.#velY = 5;
                }
            } else if (gt(this.#velY, 4)) {
                this.#velY = 4;
            }

            if (newVelXIsNegative) {
                this.#velX = neg(this.#velX);
            }

            if (newVelYIsNegative) {
                this.#velY = neg(this.#velY);
            }

            this.#posX = add(this.#posX, this.#velX);
            this.#posY = add(this.#posY, this.#velY);

            // || so it short circuits
            if (lt(this.#posX, 2) | lt(this.#posY, 2) | gt(this.#posX, 510) | gt(this.#posY, 254) || eq(Dot.#obstacles[Main.getGridIndex(this.#posX, this.#posY)], neg(1))) {
                this.#dead = neg(1);
            } else {
                if (not(gt(abs(sub(this.#posX, Dot.#goalX)), 3) | gt(abs(sub(this.#posY, Dot.#goalY)), 3))) {
                    this.#reachedGoal = neg(1);
                    this.#dead = neg(1);
                }
                if (andShow) {
                    Util.setColor(0);
                    Util.drawRectangle(sub(this.#prevX, 1), sub(this.#prevY, 1), add(this.#prevX, 1), add(this.#prevY, 1));
                    Util.setColor(neg(1));
                    this.#prevX = this.#posX;
                    this.#prevY = this.#posY;
                    Util.drawRectangle(sub(this.#prevX, 1), sub(this.#prevY, 1), add(this.#prevX, 1), add(this.#prevY, 1));
                } else {
                    // needs to be here since calculateFitness uses prevX and prevY
                    this.#prevX = this.#posX;
                    this.#prevY = this.#posY;
                }
            }
        }
    }

    calculateFitness() {
        if (this.#reachedGoal) {
            return max(10000, sub(32767, mult(Dot.#stepWeight, this.#brain.getStep())));
        }
        // needed if goal is blocked off completely and the current grid index hasnt been flooded (is 0)
        // for example if this was 0 then during the natural selection process no dot would be selected
        // because everything is 0 and it would all just evolve off of one random dot which makes no sense
        // it's also not easily possible to set it to 1 in flood itself because of ROM concerns
        return max(1, Dot.#obstacles[Main.getGridIndex(this.#prevX, this.#prevY)]);
    }
}