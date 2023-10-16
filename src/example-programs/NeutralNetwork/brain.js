import Vector from "./vector.js";
import Util from "./util.js";

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
                this.#directions[i] = Vector.randomAcc();
                i++;
            }
        }
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

    clone() {
        let directions = new Array(Brain.#brainSize);
        let i = 0;
        while (i < Brain.#brainSize) {
            directions[i] = this.#directions[i];
            i++;
        }
        return new Brain(directions);
    }

    mutate() {
        let i = 0;
        while (i < Brain.#brainSize) {
            if ((Util.random() & 32512) === 0) {
                this.#directions[i] = Vector.randomAcc();
            }
            i++;
        }
    }
}