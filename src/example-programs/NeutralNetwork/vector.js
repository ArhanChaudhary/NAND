export default class Vector {
    #x;
    #y;

    constructor(x, y) {
        this.#x = x;
        this.#y = y;
    }

    static randomAcc() {
        const mag = 2;
        const x = Math.floor(Math.random() * (mag * 2 + 1) - mag);
        const y = Math.floor(Math.random() * (mag * 2 + 1) - mag);
        if (x * x + y * y > mag * mag) {
            return Vector.randomAcc();
        }
        return new Vector(x, y);
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

    addVelocity(acc) {
        let x = this.#x + acc.getX();
        let y = this.#y + acc.getY();
        
        if (x < 0) {
            var xIsNegative = true;
            x = -x;
        }
        if (y < 0) {
            var yIsNegative = true;
            y = -y;
        }

        // if (x > 1) {
        //     x--;
        // }

        // if (y > 1) {
        //     y--;
        // }

        if (x > 5) {
            x = 5;
            y = 0;
        } else if (x === 4) {
            if (y > 3) {
                y = 3;
            }
        } else if (x === 3 || x === 2 || x === 1) {
            if (y > 4) {
                y = 4;
            }
        } else if (x === 0) {
            if (y > 5) {
                y = 5;
            }
        }

        if (xIsNegative) {
            x = -x;
        }
        if (yIsNegative) {
            y = -y;
        }
        this.#x = x;
        this.#y = y;
    }

    clone() {
        return new Vector(this.#x, this.#y);
    }
}