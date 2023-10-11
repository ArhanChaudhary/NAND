import Vector from "./vector";

export class Dot {
    private pos: Vector;
    private vel: Vector;
    private acc: Vector;

    constructor() {
        this.pos = new Vector(256, 128);
        this.vel = new Vector(0, 0);
        this.acc = new Vector(0, 0);
    }

    public show(ctx: CanvasRenderingContext2D) {
        debugger;
        ctx.beginPath();
        // draw as a 2x2 rectangle
        ctx.rect(this.pos.getX(), this.pos.getY(), 2, 2);
        ctx.fill();
    }   
}