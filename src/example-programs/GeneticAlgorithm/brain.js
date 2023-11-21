import AccelerationVectorPair from "./accelerationvectorpair.js";
import Util from "./util.js";

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
            this.#step = Util.neg(1);
            this.#directions = directions;
        } else {
            let i = 0;
            this.#step = Util.neg(1);
            this.#directions = new Array(Brain.#brainSize);
            while (Util.lt(i, Brain.#brainSize)) {
                this.#directions[i] = AccelerationVectorPair.random();
                i = Util.add(i, 1);
            }
        }
    }

    instantiate() {
        this.#step = Util.neg(1);
    }

    getDirections() {
        return this.#directions;
    }

    incStep() {
        this.#step = Util.add(this.#step, 1);
    }

    getStep() {
        return Util.add(this.#step, 1);
    }

    getNextDirection() {
        this.#step = Util.add(this.#step, 1);
        return this.#directions[this.#step];
    }
}