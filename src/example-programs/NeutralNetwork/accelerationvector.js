import Util from "./util.js";

export default class AccelerationVector {
    #x;
    #y;
    static #cache;

    static init() {
        AccelerationVector.#cache = new Array(12);
        AccelerationVector.#cache[0] = new AccelerationVector(0, 0);
        AccelerationVector.#cache[1] = new AccelerationVector(0, 1);
        AccelerationVector.#cache[2] = new AccelerationVector(1, 0);
        AccelerationVector.#cache[3] = new AccelerationVector(1, 1);
        AccelerationVector.#cache[4] = new AccelerationVector(2, 0);
        AccelerationVector.#cache[5] = new AccelerationVector(0, 2);
        AccelerationVector.#cache[6] = new AccelerationVector(0, -1);
        AccelerationVector.#cache[7] = new AccelerationVector(1, -1);
        AccelerationVector.#cache[8] = new AccelerationVector(0, -2);
        AccelerationVector.#cache[9] = new AccelerationVector(-1, 0);
        AccelerationVector.#cache[10] = new AccelerationVector(-1, 1);
        AccelerationVector.#cache[11] = new AccelerationVector(-2, 0);
    }

    constructor(x, y) {
        this.#x = x;
        this.#y = y;
    }

    static random() {
        let rand = Util.random() & 30720;
        while (!(rand < 22529)) {
            rand = Util.random() & 30720;
        }
        if (rand === 2048) {
            rand = 1;
        } else if (rand === 4096) {
            rand = 2;
        } else if (rand === 6144) {
            rand = 3;
        } else if (rand === 8192) {
            rand = 4;
        } else if (rand === 10240) {
            rand = 5;
        } else if (rand === 12288) {
            rand = 6;
        } else if (rand === 14336) {
            rand = 7;
        } else if (rand === 16384) {
            rand = 8;
        } else if (rand === 18432) {
            rand = 9;
        } else if (rand === 20480) {
            rand = 10;
        } else if (rand === 22528) {
            rand = 11;
        }
        return AccelerationVector.#cache[rand];
    }

    getX() {
        return this.#x;
    }

    getY() {
        return this.#y;
    }
}