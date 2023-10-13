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

    static randomAcc() {
        return new Vector(Math.floor(Math.random() * 11 - 5), Math.floor(Math.random() * 11 - 5));
    }

    getX() {
        return this.#x;
    }

    getY() {
        return this.#y;
    }

    add(v) {
        // add vector v to this vector but limit at positive and negative limit
        this.#x = Math.min(this.#x + v.getX(), this.#limit);
        this.#y = Math.min(this.#y + v.getY(), this.#limit);
        this.#x = Math.max(this.#x, -this.#limit);
        this.#y = Math.max(this.#y, -this.#limit);
    }

    clone() {
        return new Vector(this.#x, this.#y, this.#limit);
    }
}