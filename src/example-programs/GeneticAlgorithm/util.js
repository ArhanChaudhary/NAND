let ctx = document.getElementById("canvas").getContext("2d");
ctx.textAlign = "center";
ctx.textBaseline = "middle";
ctx.font = "7px monospace";
export default class Util {
    static #next;
    static #keyPressed;

    static init() {
        Util.setColor(true);
        Util.#next = 42;

        let prev;
        document.addEventListener("keydown", e => {
            let keyValue = {
                Enter: 128,
                Backspace: 129,
                ArrowLeft: 130,
                ArrowUp: 131,
                ArrowRight: 132,
                ArrowDown: 133,
                Home: 134,
                End: 135,
                PageUp: 136,
                PageDown: 137,
                Insert: 138,
                Delete: 139,
                Escape: 140,
                F1: 141,
                F2: 142,
                F3: 143,
                F4: 144,
                F5: 145,
                F6: 146,
                F7: 147,
                F8: 148,
                F9: 149,
                F10: 150,
                F11: 151,
                F12: 152,
            }[e.key];
            if (keyValue === undefined) {
                if (e.key.length !== 1) return;
                keyValue = e.key.charCodeAt(0);
            }
            if (keyValue !== prev && prev !== 0) {
                keyValue = 0;
            }
            prev = keyValue;
            this.#keyPressed = keyValue;
        });

        document.addEventListener("keyup", () => {
            prev = 0;
            this.#keyPressed = 0;
        });
    }

    static drawRectangle(x1, y1, x2, y2) {
        ctx.beginPath();
        ctx.rect(x1, y1, x2 - x1 + 1, y2 - y1 + 1);
        ctx.fill();
    }

    static setColor(b) {
        if (b) {
            ctx.fillStyle = 'black';
        } else {
            ctx.fillStyle = 'white';
        }
    }

    static drawText(text, posX, posY) {
        ctx.fillText(text, posX, posY);
    }

    static random() {
        Util.#next = (Util.#next * 17565 + 2489) & 65535;
        if (Util.#next >= 32768) {
            Util.#next -= 65536;
        }
        return Util.#next;
        // return Math.trunc(Math.random() * 65536);
    }

    static clearScreen() {
        ctx.clearRect(0, 0, 512, 256);
    }

    static keyPressed() {
        return this.#keyPressed;
    }
}