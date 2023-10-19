import Population from "./population.js";
import AccelerationVector from "./accelerationvector.js";
import Dot from "./dot.js";
import Util from "./util.js";
import Brain from "./brain.js";

export class Main {
    static main() {
        let population;

        let brainSize = 150;
        let populationCount = 60;
        let seed = 4;
        let goalX = 500;
        let goalY = 128;
        let onlyBest = false;

        Util.init(seed);
        AccelerationVector.init();
        Brain.init(brainSize);
        Dot.init(goalX, goalY, brainSize);

        population = new Population(populationCount, brainSize);
        Util.drawRect(goalX - 2, goalY - 2, 4, 4);
        window.interval = 25;
        function test() {
            if (!population.allDotsDead()) {
                population.update();
                population.show(onlyBest);
            } else {
                Util.clearScreen();
                population.naturalSelection();
                Util.drawRect(goalX - 2, goalY - 2, 4, 4);
            }
            setTimeout(test, window.interval);
        }
        test();
    }
}
Main.main();