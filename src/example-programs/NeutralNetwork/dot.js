import Vector from "./vector.js";
import Brain from "./brain.js";
import Util, { ctx } from "./util.js";

export default class Dot {
    #pos;
    #vel;
    #acc;
    #brain;
    #dead;
    #fitness;
    #reachedGoal;
    #prevX;
    #prevY;
    static #goal;

    static setGoal(goal) {
        Dot.#goal = goal;
    }

    constructor(brain) {
        this.#dead = false;
        this.#fitness = 0;
        this.#reachedGoal = false;
        this.#prevX = 0;
        this.#prevY = 0;

        this.#brain = brain || Brain.new(150);
        this.#pos = new Vector(10, 128);
        this.#vel = new Vector(0, 0);
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

    show() {
        if (!(this.#prevX === 0 || this.#prevY === 0)) {
            ctx.fillStyle = 'white';
            Util.drawRect(this.#prevX, this.#prevY, 2, 2);
            ctx.fillStyle = 'black';
        }
        if (!(this.#dead || this.#reachedGoal)) {
            this.#prevX = this.#pos.getX() - 1;
            this.#prevY = this.#pos.getY() - 1;
            Util.drawRect(this.#prevX, this.#prevY, 2, 2);
        } else {
            this.#prevX = 0;
            this.#prevY = 0;
        }
    }

    #move() {
        if (this.#brain.getDirections().length > this.#brain.getStep()) {
            this.#acc = this.#brain.getDirections()[this.#brain.getStep()];
            this.#brain.incStep();
        } else {
            this.#dead = true;
        }
        this.#vel.addVelocity(this.#acc);
        this.#pos.add(this.#vel);
    }

    update() {
        if (!this.#dead && !this.#reachedGoal) {
            this.#move();
            if (this.#pos.getX() < 2 || this.#pos.getY() < 2 || this.#pos.getX() > 510 || this.#pos.getY() > 254) {
                this.#dead = true;
            } else if (this.checkReachedGoal()) {
                this.#reachedGoal = true;
            }
        }
    }

    checkReachedGoal() {
        return Math.abs(this.#pos.getX() - Dot.#goal.getX()) < 4 && Math.abs(this.#pos.getY() - Dot.#goal.getY()) < 4;
    }

    calculateFitness() {
        if (this.#reachedGoal) {
            this.#fitness = Math.max(10000, 32767 - Math.floor((32767 - 10000) / this.#brain.getDirections().length) * this.#brain.getStep());
        } else {
            const x = Math.abs(this.#pos.getX() - Dot.#goal.getX()) / 2;
            const y = Math.abs(this.#pos.getY() - Dot.#goal.getY()) / 2;
            this.#fitness = Math.floor(32767 / Math.max(10, x * x + y * y - 100));
        }
    }

    getBaby() {
        return new Dot(this.#brain.clone());
    }
}