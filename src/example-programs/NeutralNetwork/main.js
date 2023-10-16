import Population from "./population.js";
import Vector from "./vector.js";
import Dot from "./dot.js";
import Util from "./util.js";
import Brain from "./brain.js";

export class Main {
    static main() {
        let goal;
        let population;

        let brainSize = 135;
        let populationCount = 60;
        let seed = 2;

        Util.init(seed);
        Vector.init();
        Brain.init(brainSize);
        goal = new Vector(500, 128);
        Dot.init(goal);

        Util.drawRect(goal.getX() - 2, goal.getY() - 2, 4, 4);
        population = new Population(populationCount);
        setInterval(() => {
            if (population.allDotsDead()) {
                Util.clearScreen();
                Util.drawRect(goal.getX() - 2, goal.getY() - 2, 4, 4);
                population.naturalSelection();
                population.mutateBabies();
            } else {
                population.update();
                population.show();
            }
        }, 25);
    }
}
Main.main();