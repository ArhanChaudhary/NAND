let ctx = document.getElementById("canvas").getContext("2d");
ctx.textAlign = "center";
ctx.textBaseline = "middle";
ctx.font = "7px monospace";
export default class Util {
    static #next;
    static #keyPressed = 0;

    static init() {
        Util.setColor(neg(1));
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
            if (keyValue == undefined) {
                if (e.key.length !== 1) return;
                keyValue = e.key.charCodeAt(0);
            }
            if (keyValue !== prev & prev !== 0) {
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

    static validate(callee, argumentsKwd) {
        let args = [...argumentsKwd];
        let calleeLen = callee.length;
        if (args.length !== calleeLen) {
            throw new Error(`Expected ${calleeLen} arguments, got ${args.length}`);
        }
        for (let i = 0; i < args.length; i++) {
            if (!Number.isInteger(args[i]) || args[i] < 0 || args[i] > 65535) {
                throw new Error(`Expected number between 0 and 65535, got ${args[i]}`);
            }
        }
    }

    static neg(n) {
        Util.validate(neg, arguments);
        return -n & 65535;
    }

    static not(n) {
        Util.validate(not, arguments);
        return ~n & 65535;
    }

    static add(a, b) {
        Util.validate(add, arguments);
        return (a + b) & 65535;
    }

    static sub(a, b) {
        Util.validate(sub, arguments);
        return (a - b) & 65535;
    }

    static mult(a, b) {
        Util.validate(mult, arguments);
        return (a * b) & 65535;
    }

    static div(a, b) {
        Util.validate(div, arguments);
        if (eq(b, 0)) {
            alert(`Division by zero: ${a}, ${b}`);
            throw new Error(`Division by zero: ${a}, ${b}`);
        }
        return Math.trunc(a / b);
    }

    static lt(a, b) {
        Util.validate(lt, arguments);
        if (a >= 32768) a -= 65536;
        if (b >= 32768) b -= 65536;
        return a < b ? neg(1) : 0;
    }

    static eq(a, b) {
        Util.validate(eq, arguments);
        return a === b ? neg(1) : 0;
    }

    static gt(a, b) {
        Util.validate(gt, arguments);
        if (a >= 32768) a -= 65536;
        if (b >= 32768) b -= 65536;
        return a > b ? neg(1) : 0;
    }

    static max(a, b) {
        if (gt(a, b)) return a;
        return b;
    }

    static min(a, b) {
        if (gt(a, b)) return b;
        return a;
    }

    static drawRectangle(x1, y1, x2, y2) {
        ctx.beginPath();
        ctx.rect(x1, y1, x2 - x1 + 1, y2 - y1 + 1);
        ctx.fill();
    }

    static setColor(b) {
        if (eq(b, neg(1))) {
            ctx.fillStyle = 'black';
        } else if (eq(b, 0)) {
            ctx.fillStyle = 'white';
        }
    }

    static drawText(text, posX, posY) {
        ctx.fillText(text, posX, posY);
    }

    static random() {
        Util.#next = add(mult(Util.#next, 25173), 13849);
        return Util.#next;
    }

    static abs(n) {
        if (gt(n, 0))
            return n;
        return neg(n);
    }

    static clearScreen() {
        ctx.clearRect(0, 0, 512, 256);
    }

    static keyPressed() {
        return this.#keyPressed;
    }
}
const div = Util.div;
const gt = Util.gt;
const neg = Util.neg;
const not = Util.not;
const add = Util.add;
const lt = Util.lt;
const eq = Util.eq;
const sub = Util.sub;
const mult = Util.mult;