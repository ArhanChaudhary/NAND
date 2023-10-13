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
        this.#brain = brain || new Brain(450);
        this.#pos = new Vector(480, 25);
        this.#vel = new Vector(0, 0, 5);
        this.#acc = new Vector(0, 0);
    }

    getFitness() {
        return this.#fitness;
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

    setIsBest(isBest) {
        this.#isBest = isBest;
    }

    show() {
        if (this.#prevX !== 0 && this.#prevY !== 0) {
            drawRect(this.#prevX, this.#prevY, this.#prevX + 2, this.#prevY + 2, "white");
        }
        if (this.#dead) {
            this.#prevX = 0;
            this.#prevY = 0;
        } else {
            this.#prevX = this.#pos.getX() - 1;
            this.#prevY = this.#pos.getY() - 1;
            drawRect(this.#prevX, this.#prevY, this.#prevX + 2, this.#prevY + 2, "black");
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
            const inFirstBarrier = this.#pos.getX() > 250 && this.#pos.getX() < 260 && this.#pos.getY() > 0 && this.#pos.getY() < 200;
            const inSecondBarrier = this.#pos.getX() > 300 && this.#pos.getX() < 512 && this.#pos.getY() > 110 && this.#pos.getY() < 120;
            const inThirdBarrier = this.#pos.getX() > 250 && this.#pos.getX() < 300 && this.#pos.getY() > 190 && this.#pos.getY() < 200;
            const inFourthBarrier = this.#pos.getX() > 150 && this.#pos.getX() < 160 && this.#pos.getY() > 100 && this.#pos.getY() < 256;
            const inFifthBarrier = this.#pos.getX() > 40 && this.#pos.getX() < 170 && this.#pos.getY() > 140 && this.#pos.getY() < 150;
            const inBarrier = inFirstBarrier || inSecondBarrier || inThirdBarrier || inFourthBarrier || inFifthBarrier;
            if (this.#pos.getX() < 2 || this.#pos.getY() < 2 || this.#pos.getX() > 510 || this.#pos.getY() > 254 || inBarrier || inSecondBarrier) {
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
            this.#fitness = Math.max(15000, 32767 - Math.floor((32767 - 15000) / this.#brain.getDirections().length) * this.#brain.getStep());
        } else {
            const x = Math.abs(this.#pos.getX() - goal.getX()) / 2;
            const y = Math.abs(this.#pos.getY() - goal.getY()) / 2;
            this.#fitness = Math.floor(32767 / Math.max(10, x * x + y * y - 100));
        }
    }

    getBaby() {
        return new Dot(this.#brain.clone());
    }
}