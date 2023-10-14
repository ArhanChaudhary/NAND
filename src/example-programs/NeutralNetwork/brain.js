import Vector from "./vector.js";
import Util from "./util.js";

export default class Brain {
    #directions;
    #step;

    constructor(size, directions) {
        this.#step = 0;
        if (directions) {
            this.#directions = directions;
        } else {
            this.#directions = new Array(size);
            let i = 0;
            while (i < this.#directions.length) {
                this.#directions[i] = Vector.randomAcc();
                i++;
            }
        }
    }

    static new(size) {
        return new Brain(size);
    }

    static newWithDirections(directions) {
        return new Brain(null, directions);
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
        const directions = new Array(this.#directions.length);
        let i = 0;
        while (i < this.#directions.length) {
            directions[i] = this.#directions[i];
            i++;
        }
        return Brain.newWithDirections(directions);
    }

    mutate() {
        let i = 0;
        while (i < this.#directions.length) {
            const rand = Util.random();
            debugger;
            if (rand & 127 === 0) {
                this.#directions[i] = Vector.randomAcc();
            }
            i++;
        }
    }
}