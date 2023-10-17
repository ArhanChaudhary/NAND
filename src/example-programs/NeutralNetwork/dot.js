import Brain from "./brain.js";
import Util, { ctx } from "./util.js";

export default class Dot {
    #posX;
    #posY;
    #velX;
    #velY;
    #acc;
    #brain;
    #dead;
    #reachedGoal;
    #prevX;
    #prevY;
    static #goalX;
    static #goalY;
    static #stepWeight;

    static init(goalX, goalY) {
        Dot.#goalX = goalX;
        Dot.#goalY = goalY;
        Dot.#stepWeight = Math.floor((32767 - 10000) / Brain.getBrainSize());
    }

    constructor(brain) {
        this.instantiate(brain);
    }

    instantiate(brain) {
        this.#dead = false;
        this.#reachedGoal = false;
        this.#prevX = 0;
        this.#prevY = 0;

        this.#brain = brain || new Brain();
        this.#posX = 10;
        this.#posY = 128;
        this.#velX = 0;
        this.#velY = 0;
        this.#acc = null;
    }

    getDead() {
        return this.#dead;
    }

    setDead(dead) {
        this.#dead = dead;
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
        let newVelX;
        let newVelY;
        let newVelXIsNegative;
        let newVelYIsNegative;
        if (!this.#dead) {
            if (!(Brain.getBrainSize() > this.#brain.getStep())) {
                this.#dead = true;
            } else {
                this.#acc = this.#brain.getNextDirection();
            }

            newVelX = this.#velX + this.#acc.getX();
            newVelY = this.#velY + this.#acc.getY();
            newVelXIsNegative = newVelX < 0;
            newVelYIsNegative = newVelY < 0;
    
            if (newVelXIsNegative) {
                newVelX = -newVelX;
            }

            if (newVelYIsNegative) {
                newVelY = -newVelY;
            }

            if (newVelX > 5) {
                newVelX = 5;
                newVelY = 0;
            } else if (newVelX === 4) {
                if (newVelY > 3) {
                    newVelY = 3;
                }
            } else if (newVelX === 3 || newVelX === 2 || newVelX === 1) {
                if (newVelY > 4) {
                    newVelY = 4;
                }
            } else if (newVelX === 0) {
                if (newVelY > 5) {
                    newVelY = 5;
                }
            }

            if (newVelXIsNegative) {
                newVelX = -newVelX;
            }
            if (newVelYIsNegative) {
                newVelY = -newVelY;
            }

            this.#velX = newVelX;
            this.#velY = newVelY;

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
    }

    calculateFitness() {
        let x;
        let y;
        if (!this.#reachedGoal) {
            x = Math.abs(this.#posX - Dot.#goalX) / 2;
            y = Math.abs(this.#posY - Dot.#goalY) / 2;
            return Math.floor(32767 / Math.max(10, x * x + y * y - 100));
        }
        return Math.max(10000, 32767 - Dot.#stepWeight * this.#brain.getStep());
    }

    getBaby() {
        return new Dot(this.#brain.clone());
    }
}