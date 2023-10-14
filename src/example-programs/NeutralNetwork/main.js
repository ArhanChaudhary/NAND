import Population from "./population.js";
import Vector from "./vector.js";
import Dot from "./dot.js";
import Util from "./util.js";

export class Main {
    static main() {
        Util.init();
        const goal = new Vector(500, 128);
        Dot.init(goal);

        Util.drawRect(goal.getX() - 2, goal.getY() - 2, 4, 4);
        const population = new Population(75);
        setInterval(() => {
            if (population.allDotsDead()) {
                Util.clearScreen();
                Util.drawRect(goal.getX() - 2, goal.getY() - 2, 4, 4);
                population.calculateFitness();
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