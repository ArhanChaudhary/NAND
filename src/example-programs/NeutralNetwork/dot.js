import Vector from "./vector.js";
import Brain from "./brain.js";
import { drawRect, goal } from "./main.js";

export default class Dot {
    #pos;
    #vel;
    #acc;
    #brain;
    #dead = false;
    #fitness = 0;
    #reachedGoal = false;
    #isBest = false;
    #prevX = 0;
    #prevY = 0;

    constructor(brain) {
        this.#brain = brain || new Brain(200);
        this.#pos = new Vector(256, 246);
        this.#vel = new Vector(0, 0, 5);
        this.#acc = new Vector(0, 0);
    }

    getFitness() {
        return this.#fitness;
    }

    getDead() {
        return this.#dead;
    }

    getBrain() {
        return this.#brain;
    }

    setBrain(brain) {
        this.#brain = brain;
    }

    setIsBest(isBest) {
        this.#isBest = isBest;
    }

    show() {
        if (this.#prevX !== 0 && this.#prevY !== 0) {
            drawRect(this.#prevX, this.#prevY, this.#prevX + 2, this.#prevY + 2, "white");
        }
        if (!this.#dead) {
            this.#prevX = this.#pos.getX() - 1;
            this.#prevY = this.#pos.getY() - 1;
            if (this.#isBest) {
                drawRect(this.#prevX, this.#prevY, this.#prevX + 2, this.#prevY + 2, "red");
            } else {
                drawRect(this.#prevX, this.#prevY, this.#prevX + 2, this.#prevY + 2, "black");
            }
        }
    }

    #move() {
        if (this.#brain.getDirections().length > this.#brain.getStep()) {
            this.#acc = this.#brain.getDirections()[this.#brain.getStep()];
            this.#brain.incStep();
        } else {
            this.#dead = true;
        }
        this.#vel.add(this.#acc);
        this.#pos.add(this.#vel);
    }

    update() {
        if (!this.#dead && !this.#reachedGoal) {
            this.#move();
            if (this.#pos.getX() < 2 | this.#pos.getY() < 2 | this.#pos.getX() > 510 | this.#pos.getY() > 254) {
                this.#dead = true;
            } else if (this.checkReachedGoal()) {
                this.#reachedGoal = true;
            }
        }
    }

    checkReachedGoal() {
        return Math.abs(this.#pos.getX() - goal.getX()) < 4 && Math.abs(this.#pos.getY() - goal.getY()) < 4;
    }

    calculateFitness() {
        if (this.#reachedGoal) {
            this.#fitness = 32767 - 100 * this.#brain.getStep();
        } else {
            const x = Math.abs(this.#pos.getX() - goal.getX()) / 2;
            const y = Math.abs(this.#pos.getY() - goal.getY()) / 2;
            this.#fitness = Math.floor(250 / (x * x + y * y + 1));
        }
    }

    getBaby() {
        const brain = this.#brain.clone();
        return new Dot(brain);
    }
}