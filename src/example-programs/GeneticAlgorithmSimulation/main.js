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
    static #obstacles;

    static main() {
        AccelerationVector.init();
        Population.init();

        Main.#brainSize = 145;
        Main.#populationCount = 60;
        Main.#seed = 5;
        Main.#initialX = 10;
        Main.#initialY = 128;
        Main.#goalX = 500;
        Main.#goalY = 128;
        Main.#onlyBest = false;
        Main.#obstacles = new Array(512);

        Main.#obstacles[104] = true;
        Main.#obstacles[136] = true;
        Main.#obstacles[168] = true;
        Main.#obstacles[200] = true;
        Main.#obstacles[232] = true;
        Main.#obstacles[264] = true;
        Main.#obstacles[296] = true;
        Main.#obstacles[328] = true;
        Main.#obstacles[360] = true;

        Util.config(Main.#seed);
        Brain.config(Main.#brainSize);
        Dot.config(Main.#initialX, Main.#initialY, Main.#goalX, Main.#goalY, Main.#brainSize, Main.#obstacles);
        Population.config(Main.#populationCount, Main.#brainSize, Main.#onlyBest);

        Main.#refreshDisplay();
        window.interval = 25;
        function test() {
            if (!Population.allDotsDead()) {
                Population.update();
            } else {
                Population.naturalSelection();
                Main.#refreshDisplay();
            }
            setTimeout(test, window.interval);
        }
        test();
    }

    static #refreshDisplay() {
        let i;
        let obstacleX;
        let obstacleY;
        Util.drawRect(Main.#goalX - 2, Main.#goalY - 2, Main.#goalX + 2, Main.#goalY + 2);

        i = 0;
        while (!(i > 511)) {
            if (this.#obstacles[i]) {
                obstacleY = 0;
                obstacleX = i;
                while (!(obstacleX < 32)) {
                    obstacleX -= 32;
                    obstacleY += 16;
                }
                obstacleX = i - (obstacleY + obstacleY);
                obstacleX = obstacleX + obstacleX;
                obstacleX = obstacleX + obstacleX;
                obstacleX = obstacleX + obstacleX;
                obstacleX = obstacleX + obstacleX;
                Util.drawRect(obstacleX, obstacleY, obstacleX + 15, obstacleY + 15);
            }
            i++;
        }
        console.log(Population.getGen());
        console.log(Dot.getMinStep());
    }
}
Main.main();