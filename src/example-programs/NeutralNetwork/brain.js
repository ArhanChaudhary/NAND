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
            this.#directions[i] = Vector.randomAcc();
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

    mutate() {
        for (let i = 0; i < this.#directions.length; i++) {
            const rand = Math.random();
            if (Math.floor(rand * 100) === 0) {
                this.#directions[i] = Vector.randomAcc();
            }
        }
    }
}