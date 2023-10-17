import Population from "./population.js";
import AccelerationVector from "./accelerationvector.js";
import Dot from "./dot.js";
import Util from "./util.js";
import Brain from "./brain.js";

export class Main {
    static main() {
        let goal;
        let population;

        let brainSize = 135;
        let populationCount = 60;
        let seed = 4;
        let goalX = 500;
        let goalY = 128;

        Util.init(seed);
        AccelerationVector.init();
        Brain.init(brainSize);
        Dot.init(goalX, goalY);

        Util.drawRect(goalX - 2, goalY - 2, 4, 4);
        population = new Population(populationCount);
        window.interval = 0;
        function test() {
            if (population.allDotsDead()) {
                Util.clearScreen();
                population.naturalSelection();
                Util.drawRect(goalX - 2, goalY - 2, 4, 4);
            } else {
                population.update();
                population.show();
            }
            setTimeout(test, window.interval);
        }
        test();
    }
}
Main.main();