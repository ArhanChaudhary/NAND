import Vector from "./vector.js";
import Brain from "./brain.js";
import { drawRect } from "./main.js";

export default class Dot {
    #pos;
    #vel;
    #acc;
    #brain;
    #dead = false;
    #prevX = 0;
    #prevY = 0;

    constructor() {
        this.#brain = new Brain(200);
        this.#pos = new Vector(256, 246);
        this.#vel = new Vector(0, 0, 5);
        this.#acc = new Vector(0, 0);
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
        if (this.#dead) return;
        this.move();
        if (this.#pos.getX() < 2 | this.#pos.getY() < 2 | this.#pos.getX() > 510 | this.#pos.getY() > 254) {
            this.#dead = true;
        }
    }
}