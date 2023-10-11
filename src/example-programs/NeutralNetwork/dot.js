import Vector from "./vector.js";
import Brain from "./brain.js";

export class Dot {
    #pos;
    #vel;
    #acc;
    #brain;
    #prevX = 0;
    #prevY = 0;

    constructor() {
        this.#brain = new Brain(200);
        this.#pos = new Vector(256, 128);
        this.#vel = new Vector(0, 0, 5);
        this.#acc = new Vector(0, 0);
    }

    show(ctx) {
        if (this.#prevX !== 0 && this.#prevY !== 0) {
            ctx.beginPath();
            ctx.fillStyle = "white";
            ctx.rect(this.#prevX, this.#prevY, 2, 2);
            ctx.fill();
        }
        ctx.beginPath();
        ctx.fillStyle = "black";
        // draw as a 2x2 rectangle
        ctx.rect(this.#pos.getX(), this.#pos.getY(), 2, 2);
        ctx.fill();
        this.#prevX = this.#pos.getX();
        this.#prevY = this.#pos.getY();
    }

    move() {
        if (this.#brain.getDirections().length > this.#brain.getStep()) {
            this.#acc = this.#brain.getDirections()[this.#brain.getStep()];
            this.#brain.incStep();
        }
        this.#vel.add(this.#acc);
        this.#pos.add(this.#vel);
    }
}