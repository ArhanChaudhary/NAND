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
        i = Util.neg(2);
        while (Util.lt(i, 3)) {
            j = Util.neg(2);
            while (Util.lt(j, 3)) {
                if (Util.lt(Util.add(Util.abs(i), Util.abs(j)), 3)) {
                    k = Util.neg(2);
                    while (Util.lt(k, 3)) {
                        l = Util.neg(2);
                        while (Util.lt(l, 3)) {
                            if (Util.lt(Util.add(Util.abs(k), Util.abs(l)), 3)) {
                                AccelerationVectorPair.#cache[c] = new AccelerationVectorPair(i, j, k, l);
                                c = Util.add(c, 1);
                            }
                            l = Util.add(l, 1);
                        }
                        k = Util.add(k, 1);
                    }
                }
                j = Util.add(j, 1);
            }
            i = Util.add(i, 1);
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
        while (Util.not(Util.lt(rand, 169))) {
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