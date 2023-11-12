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
            this.#step = 0;
            this.#directions = directions;
        } else {
            let i = 0;
            this.#step = 0;
            this.#directions = new Array(Brain.#brainSize);
            while (i < Brain.#brainSize) {
                this.#directions[i] = AccelerationVectorPair.random();
                i++;
            }
        }
    }

    instantiate() {
        this.#step = 0;
    }

    getDirections() {
        return this.#directions;
    }

    getStep() {
        return this.#step;
    }

    getNextDirection() {
        let ret = this.#directions[this.#step];
        this.#step++;
        return ret;
    }
}