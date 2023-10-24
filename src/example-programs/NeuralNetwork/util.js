export let ctx = document.getElementById("canvas").getContext("2d");
ctx.fillStyle = 'black';
export default class Util {
    static #next;

    static config(seed) {
        Util.#next = seed;
    }

    static drawRect(x1, y1, x2, y2) {
        ctx.beginPath();
        ctx.rect(x1, y1, x2, y2);
        ctx.fill();
    }

    static random() {
        Util.#next = (Util.#next * 17565 + 2489) & 65535;
        if (Util.#next >= 32768) {
            Util.#next -= 65536;
        }
        return Util.#next;
        // return Math.floor(Math.random() * 65536);
    }

    static clearScreen() {
        ctx.clearRect(0, 0, 512, 256);
    }
}