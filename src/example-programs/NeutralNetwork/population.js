import Dot from './dot.js';

export default class Population {
    #dots;

    constructor(size) {
        this.#dots = new Array(size);
        for (let i = 0; i < this.#dots.length; i++) {
            this.#dots[i] = new Dot();
        }
    }

    show(ctx) {
        for (let dot of this.#dots) {
            dot.show(ctx);
        }
    }

    update() {
        for (let dot of this.#dots) {
            dot.update();
        }
    }
}