import Vector from "./vector.js";

export class Dot {
    #pos;
    #vel;
    #acc;
    #prevX = 0;
    #prevY = 0;

    constructor() {
        this.#pos = new Vector(256, 128);
        this.#vel = new Vector(10, 10);
        this.#acc = new Vector(10, 10);
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
        this.#vel.add(this.#acc);
        this.#pos.add(this.#vel);
    }
}