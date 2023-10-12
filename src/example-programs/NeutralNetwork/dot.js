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
    #prevX = 0;
    #prevY = 0;

    constructor() {
        this.#brain = new Brain(200);
        this.#pos = new Vector(256, 128);
        this.#vel = new Vector(0, 0, 5);
        this.#acc = new Vector(0, 0);
    }

    getDead() {
        return this.#dead;
    }

    show() {
        if (this.#prevX !== 0 && this.#prevY !== 0) {
            drawRect(this.#prevX, this.#prevY, this.#prevX + 2, this.#prevY + 2, "white");
        }
        this.#prevX = this.#pos.getX() - 1;
        this.#prevY = this.#pos.getY() - 1;
        drawRect(this.#prevX, this.#prevY, this.#prevX + 2, this.#prevY + 2, "black");
    }

    move() {
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
            this.move();
            if (this.#pos.getX() < 2 | this.#pos.getY() < 2 | this.#pos.getX() > 510 | this.#pos.getY() > 254) {
                this.#dead = true;
            } else if (this.checkReachedGoal()) {
                this.#reachedGoal = true;
            }
        }
    }

    calculateFitness() {
        const x = Math.abs(this.#pos.getX() - goal.getX());
        const y = Math.abs(this.#pos.getY() - goal.getY());
        const xTimesY = x * y;
        if (xTimesY > 32767) {
            this.#fitness = 0;
            return;
        }
        const distance = (x + y) - xTimesY / (x + y);
        this.#fitness = Math.floor(250 / (distance * distance));
    }

    checkReachedGoal() {
        // compare the gets of the goal and the pos. They can be up to 4 off
        return Math.abs(this.#pos.getX() - goal.getX()) < 4 && Math.abs(this.#pos.getY() - goal.getY()) < 4;
    }
}