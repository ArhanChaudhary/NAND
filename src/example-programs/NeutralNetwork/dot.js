import Vector from "./vector.js";
import Brain from "./brain.js";
import Util, { ctx } from "./util.js";

export default class Dot {
    #posX;
    #posY;
    #vel;
    #acc;
    #brain;
    #dead;
    #reachedGoal;
    #prevX;
    #prevY;
    static #goal;
    static #stepWeight;

    static init(goal) {
        Dot.#goal = goal;
        Dot.#stepWeight = Math.floor((32767 - 10000) / Brain.getBrainSize());
    }

    constructor(brain) {
        this.#dead = false;
        this.#reachedGoal = false;
        this.#prevX = 0;
        this.#prevY = 0;

        this.#brain = brain || new Brain();
        this.#posX = 10;
        this.#posY = 128;
        this.#vel = new Vector(0, 0);
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

    show() {
        if (!(this.#dead || this.#reachedGoal)) {
            ctx.fillStyle = 'white';
            Util.drawRect(this.#prevX, this.#prevY, 2, 2);
            ctx.fillStyle = 'black';
            this.#prevX = this.#posX - 1;
            this.#prevY = this.#posY - 1;
            Util.drawRect(this.#prevX, this.#prevY, 2, 2);
        }
    }

    update() {
        if (!(this.#dead || this.#reachedGoal)) {
            if (!(Brain.getBrainSize() > this.#brain.getStep())) {
                this.#dead = true;
            } else {
                this.#acc = this.#brain.getNextDirection();
            }
            this.#vel.addVelocity(this.#acc);
            this.#posX += this.#vel.getX();
            this.#posY += this.#vel.getY();

            if (!(this.#posX < 2 || this.#posY < 2 || this.#posX > 510 || this.#posY > 254)) {
                if (this.checkReachedGoal()) {
                    this.#reachedGoal = true;
                }
            } else {
                this.#dead = true;
            }
        }
    }

    checkReachedGoal() {
        return Math.abs(this.#posX - Dot.#goal.getX()) < 4 && Math.abs(this.#posY - Dot.#goal.getY()) < 4;
    }

    calculateFitness() {
        let x;
        let y;
        if (!this.#reachedGoal) {
            x = Math.abs(this.#posX - Dot.#goal.getX()) / 2;
            y = Math.abs(this.#posY - Dot.#goal.getY()) / 2;
            return Math.floor(32767 / Math.max(10, x * x + y * y - 100));
        }
        return Math.max(10000, 32767 - Dot.#stepWeight * this.#brain.getStep());
    }

    getBaby() {
        return new Dot(this.#brain.clone());
    }
}