import Util from "./util.js";

export default class Vector {
    #x;
    #y;
    static #accVectors;

    static init() {
        Vector.#accVectors = new Array(12);
        Vector.#accVectors[0] = new Vector(0, 0);
        Vector.#accVectors[1] = new Vector(0, 1);
        Vector.#accVectors[2] = new Vector(1, 0);
        Vector.#accVectors[3] = new Vector(1, 1);
        Vector.#accVectors[4] = new Vector(2, 0);
        Vector.#accVectors[5] = new Vector(0, 2);
        Vector.#accVectors[6] = new Vector(0, -1);
        Vector.#accVectors[7] = new Vector(1, -1);
        Vector.#accVectors[8] = new Vector(0, -2);
        Vector.#accVectors[9] = new Vector(-1, 0);
        Vector.#accVectors[10] = new Vector(-1, 1);
        Vector.#accVectors[11] = new Vector(-2, 0);
    }

    constructor(x, y) {
        this.#x = x;
        this.#y = y;
    }

    static randomAcc() {
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
        return Vector.#accVectors[rand];
    }

    getX() {
        return this.#x;
    }

    getY() {
        return this.#y;
    }
}