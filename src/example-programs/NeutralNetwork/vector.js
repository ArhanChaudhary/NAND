export default class Vector {
    #x;
    #y;
    #limit;

    constructor(x, y, limit) {
        this.#x = x;
        this.#y = y;
        if (limit === undefined) {
            this.#limit = Infinity;
        } else {
            this.#limit = limit;
        }
    }

    getX() {
        return this.#x;
    }

    getY() {
        return this.#y;
    }

    add(v) {
        this.#x = Math.min(this.#limit, this.#x + v.getX());
        this.#y = Math.min(this.#limit, this.#y + v.getY());
    }

    clone() {
        return new Vector(this.#x, this.#y, this.#limit);
    }
}