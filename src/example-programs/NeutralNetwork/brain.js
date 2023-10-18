import AccelerationVector from "./accelerationvector.js";

export default class Brain {
    #directions;
    #step;
    static #brainSize;
    
    static init(brainSize) {
        Brain.#brainSize = brainSize;
    }

    static getBrainSize() {
        return Brain.#brainSize;
    }

    constructor(directions) {
        this.#step = 0;
        if (directions) {
            this.#directions = directions;
        } else {
            this.#directions = new Array(Brain.#brainSize);
            let i = 0;
            while (i < Brain.#brainSize) {
                this.#directions[i] = AccelerationVector.random();
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