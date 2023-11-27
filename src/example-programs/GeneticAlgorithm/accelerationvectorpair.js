import Util from "./util.js";

const div = Util.div;
const gt = Util.gt;
const neg = Util.neg;
const not = Util.not;
const add = Util.add;
const lt = Util.lt;
const eq = Util.eq;
const abs = Util.abs;
const sub = Util.sub;
const max = Util.max;
const mult = Util.mult;
const min = Util.min;
const random = Util.random;
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
        i = neg(2);
        while (lt(i, 3)) {
            j = neg(2);
            while (lt(j, 3)) {
                if (lt(add(abs(i), abs(j)), 3)) {
                    k = neg(2);
                    while (lt(k, 3)) {
                        l = neg(2);
                        while (lt(l, 3)) {
                            if (lt(add(abs(k), abs(l)), 3)) {
                                AccelerationVectorPair.#cache[c] = new AccelerationVectorPair(i, j, k, l);
                                c = add(c, 1);
                            }
                            l = add(l, 1);
                        }
                        k = add(k, 1);
                    }
                }
                j = add(j, 1);
            }
            i = add(i, 1);
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
        while (not(lt(rand, 169))) {
            rand = div(random() & 32640, 128);
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