export const ctx = document.getElementById("canvas").getContext("2d");
ctx.fillStyle = 'black';
export default class Util {
    static #next;

    static init() {
        Util.#next = 0;
    }

    static drawRect(x1, y1, x2, y2) {
        ctx.beginPath();
        ctx.rect(x1, y1, x2, y2);
        ctx.fill();
    }

    static random() {
        Util.#next = (Util.#next * 11753 + 2489) % 65536;
        return Util.#next;
    }
}