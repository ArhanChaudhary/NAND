import Dot from './dot.js';

export default class Population {
    #dots;

    constructor(size) {
        this.#dots = new Array(size);
        for (let i = 0; i < this.#dots.length; i++) {
            this.#dots[i] = new Dot();
        }
    }

    show() {
        for (let dot of this.#dots) {
            dot.show();
        }
    }

    update() {
        for (let dot of this.#dots) {
            dot.update();
        }
    }

    calculateFitness() {
        for (let dot of this.#dots) {
            dot.calculateFitness();
        }
    }

    allDotsDead() {
        for (let dot of this.#dots) {
            if (!dot.getDead() && !dot.checkReachedGoal()) return false;
        }
        return true;
    }
}