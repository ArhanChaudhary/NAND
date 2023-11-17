import AccelerationVectorPair from "./accelerationvectorpair.js";

export default class Brain {
    #directions;
    #step;
    static #brainSize;

    static config(brainSize) {
        Brain.#brainSize = brainSize;
    }

    static getBrainSize() {
        return Brain.#brainSize;
    }

    constructor(directions) {
        if (directions) {
            this.#step = -1;
            this.#directions = directions;
        } else {
            let i = 0;
            this.#step = -1;
            this.#directions = new Array(Brain.#brainSize);
            while (i < Brain.#brainSize) {
                this.#directions[i] = AccelerationVectorPair.random();
                i++;
            }
        }
    }

    instantiate() {
        this.#step = -1;
    }

    getDirections() {
        return this.#directions;
    }

    incStep() {
        this.#step++;
    }

    getStep() {
        return this.#step + 1;
    }

    getNextDirection() {
        this.#step++;
        return this.#directions[this.#step];
    }
}