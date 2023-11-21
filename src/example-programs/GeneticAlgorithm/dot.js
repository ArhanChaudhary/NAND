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
        Dot.#stepWeight = Util.divide(22767, Brain.getBrainSize());
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
        if (Util.gt(this.#brain.getStep(), Dot.#minStep)) {
            this.#dead = Util.neg(1);
        } else if (Util.not(this.#dead)) {
            if (Util.not(Util.gt(Dot.#brainSize, this.#brain.getStep()))) {
                this.#dead = Util.neg(1);
            } else if (firstPairComponent) {
                this.#acc = this.#brain.getNextDirection();
            } else {
                this.#brain.incStep();
            }

            if (firstPairComponent) {
                this.#velX = Util.add(this.#velX, this.#acc.getX());
                this.#velY = Util.add(this.#velY, this.#acc.getY());
            } else {
                this.#velX = Util.add(this.#velX, this.#acc.getX2());
                this.#velY = Util.add(this.#velY, this.#acc.getY2());
            }

            newVelXIsNegative = Util.lt(this.#velX, 0);
            newVelYIsNegative = Util.lt(this.#velY, 0);

            if (newVelXIsNegative) {
                this.#velX = Util.neg(this.#velX);
            }

            if (newVelYIsNegative) {
                this.#velY = Util.neg(this.#velY);
            }

            if (Util.gt(this.#velX, 5)) {
                this.#velX = 5;
                this.#velY = 0;
            } else if (Util.eq(this.#velX, 4)) {
                if (Util.gt(this.#velY, 3)) {
                    this.#velY = 3;
                }
            } else if (Util.eq(this.#velX, 0)) {
                if (Util.gt(this.#velY, 5)) {
                    this.#velY = 5;
                }
            } else if (Util.gt(this.#velY, 4)) {
                this.#velY = 4;
            }

            if (newVelXIsNegative) {
                this.#velX = Util.neg(this.#velX);
            }

            if (newVelYIsNegative) {
                this.#velY = Util.neg(this.#velY);
            }

            this.#posX = Util.add(this.#posX, this.#velX);
            this.#posY = Util.add(this.#posY, this.#velY);

            // || so it short circuits
            if (Util.lt(this.#posX, 2) | Util.lt(this.#posY, 2) | Util.gt(this.#posX, 510) | Util.gt(this.#posY, 254) || Util.eq(Dot.#obstacles[Main.getGridIndex(this.#posX, this.#posY)], Util.neg(1))) {
                this.#dead = Util.neg(1);
            } else if (Util.not(Util.gt(Util.abs(Util.sub(this.#posX, Dot.#goalX)), 3) | Util.gt(Util.abs(Util.sub(this.#posY, Dot.#goalY)), 3))) {
                this.#reachedGoal = Util.neg(1);
                this.#dead = Util.neg(1);
            } else
            // show function
            if (andShow) {
                Util.setColor(0);
                Util.drawRectangle(Util.sub(this.#prevX, 1), Util.sub(this.#prevY, 1), Util.add(this.#prevX, 1), Util.add(this.#prevY, 1));
                Util.setColor(Util.neg(1));
                this.#prevX = this.#posX;
                this.#prevY = this.#posY;
                Util.drawRectangle(Util.sub(this.#prevX, 1), Util.sub(this.#prevY, 1), Util.add(this.#prevX, 1), Util.add(this.#prevY, 1));
            } else {
                // needs to be here since calculateFitness uses prevX and prevY
                this.#prevX = this.#posX;
                this.#prevY = this.#posY;
            }
        }
    }

    calculateFitness() {
        if (this.#reachedGoal) {
            return Util.max(10000, Util.sub(32767, Util.mult(Dot.#stepWeight, this.#brain.getStep())));
        }
        // needed if goal is blocked off completely and the current grid index hasnt been flooded (is 0)
        // for example if this was 0 then during the natural selection process no dot would be selected
        // because everything is 0 and it would all just evolve off of one random dot which makes no sense
        // it's also not easily possible to set it to 1 in flood itself because of ROM concerns
        return Util.max(1, Dot.#obstacles[Main.getGridIndex(this.#prevX, this.#prevY)]);
    }
}