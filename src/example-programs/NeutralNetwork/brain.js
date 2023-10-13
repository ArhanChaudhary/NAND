import Vector from "./vector.js";

export default class Brain {
    #directions;
    #step = 0;

    constructor(size) {
        this.#directions = new Array(size);
        this.#randomize();
    }

    #randomize() {
        for (let i = 0; i < this.#directions.length; i++) {
            this.#directions[i] = new Vector(Math.round(Math.random() * 2 - 1), Math.round(Math.random() * 2 - 1));
        }
    }

    getDirections() {
        return this.#directions;
    }

    getStep() {
        return this.#step;
    }

    incStep() {
        this.#step++;
    }

    clone() {
        const brain = new Brain(this.#directions.length);
        for (let i = 0; i < this.#directions.length; i++) {
            brain.getDirections()[i] = this.#directions[i].clone();
        }
        return brain;
    }
}