import Population from "./population.js";
import AccelerationVector from "./accelerationvector.js";
import Dot from "./dot.js";
import Util from "./util.js";
import Brain from "./brain.js";

export class Main {
    static #brainSize;
    static #populationCount;
    static #seed;
    static #initialX;
    static #initialY;
    static #goalX;
    static #goalY;
    static #onlyBest;

    static main() {
        AccelerationVector.init();
        Population.init();

        Main.#brainSize = 150;
        Main.#populationCount = 60;
        Main.#seed = 5;
        Main.#initialX = 10;
        Main.#initialY = 128;
        Main.#goalX = 500;
        Main.#goalY = 128;
        Main.#onlyBest = false;

        Util.config(Main.#seed);
        Brain.config(Main.#brainSize);
        Dot.config(Main.#initialX, Main.#initialY, Main.#goalX, Main.#goalY, Main.#brainSize);
        Population.config(Main.#populationCount, Main.#brainSize);

        Main.#updateDisplay();
        window.interval = 25;
        function test() {
            if (!Population.allDotsDead()) {
                Population.update(Main.#onlyBest);
            } else {
                Population.naturalSelection();
                Main.#updateDisplay();
            }
            setTimeout(test, window.interval);
        }
        test();
    }

    static #updateDisplay() {
        Util.drawRect(Main.#goalX - 2, Main.#goalY - 2, Main.#goalX + 2, Main.#goalY + 2);
        console.log(Population.getGen());
        console.log(Dot.getMinStep());
    }
}
Main.main();