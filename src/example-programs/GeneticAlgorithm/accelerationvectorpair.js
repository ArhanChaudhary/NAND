import Util from "./util.js";

export default class AccelerationVectorPair {
    #x;
    #y;
    #x2;
    #y2;
    static #cache;

    static init() {
        let i;
        let j;
        let k;
        let l;
        let c = 0;
        AccelerationVectorPair.#cache = new Array(169);
        i = -2;
        while (i < 3) {
            j = -2;
            while (j < 3) {
                if (Math.abs(i) + Math.abs(j) < 3) {
                    k = -2;
                    while (k < 3) {
                        l = -2;
                        while (l < 3) {
                            if (Math.abs(k) + Math.abs(l) < 3) {
                                AccelerationVectorPair.#cache[c] = new AccelerationVectorPair(i, j, k, l);
                                c = c + 1;
                            }
                            l++;
                        }
                        k++;
                    }
                }
                j++;
            }
            i++;
        }
    }

    constructor(x, y, x2, y2) {
        this.#x = x;
        this.#y = y;
        this.#x2 = x2;
        this.#y2 = y2;
    }

    static random() {
        let rand = 32767;
        while (!(rand < 169)) {
            rand = Util.divide(Util.random() & 32640, 128);
        }
        return AccelerationVectorPair.#cache[rand];
    }

    getX() {
        return this.#x;
    }

    getY() {
        return this.#y;
    }

    getX2() {
        return this.#x2;
    }

    getY2() {
        return this.#y2;
    }
}