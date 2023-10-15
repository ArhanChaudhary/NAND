import Vector from "./vector.js";
import Util from "./util.js";

export default class Brain {
    #directions;
    #step;
    static #brainSize;
    
    static init() {
        Brain.#brainSize = 150;
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

    incStep() {
        this.#step++;
    }

    getNextDirection() {
        return this.#directions[this.#step];
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
            if ((Util.random() & 127) === 0) {
                this.#directions[i] = Vector.randomAcc();
            }
            i++;
        }
    }
}