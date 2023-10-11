export default class Vector {
    #x;
    #y;

    constructor(x, y) {
        this.#x = x;
        this.#y = y;
    }

    getX() {
        return this.#x;
    }

    getY() {
        return this.#y;
    }

    add(v) {
        this.#x += v.getX();
        this.#y += v.getY();
    }
}