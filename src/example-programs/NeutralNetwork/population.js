import Dot from './dot.js';

export default class Population {
    static #dots;
    static #gen;
    static #minStep;
    static #size;

    static init() {
        Population.#gen = 1;
        Population.#minStep = 32767;

        Population.#size = 75;
    }

    constructor() {
        let i = 0;
        Population.#dots = new Array(Population.#size);
        while (i < Population.#size) {
            Population.#dots[i] = new Dot();
            i++;
        }
    }

    show() {
        let i = 0;
        while (i < Population.#size) {
            Population.#dots[i].show();
            i++;
        }
    }

    update() {
        let i = 0;
        let dot;
        while (i < Population.#size) {
            dot = Population.#dots[i];
            if (!(dot.getBrain().getStep() > Population.#minStep)) {
                dot.update();
            } else {
                dot.setDead(true);
            }
            i++;
        }
    }

    allDotsDead() {
        let i = 0;
        let dot;
        while (i < Population.#size) {
            dot = Population.#dots[i];
            if (!(dot.getDead() || dot.checkReachedGoal()))
                return false;
            i++;
        }
        return true;
    }

    naturalSelection() {
        let dot;
        let bestDot;
        let dotFitness;
        let bestFitness = -1;
        let i = 0;
        let j;
        let newDots = new Array(Population.#size);
        let sum;
        let rand;
        let fitnessSum = 0;
        while (i < Population.#size) {
            dot = Population.#dots[i];
            dotFitness = dot.calculateFitness();
            if (dotFitness > bestFitness) {
                bestFitness = dotFitness;
                bestDot = dot;
            }
            fitnessSum += dotFitness;
            i++;
        }

        if (bestDot.checkReachedGoal()) {
            Population.#minStep = bestDot.getBrain().getStep();
        }

        newDots[0] = bestDot.getBaby();
        i = 1;
        while (i < Population.#size) {
            rand = Math.random() * fitnessSum;
            sum = 0;
            j = 0;
            dot = Population.#dots[0];
            while (j < Population.#size) {
                dot = Population.#dots[j];
                sum += dot.calculateFitness();
                if (sum > rand)
                    j = Population.#size;
                j++;
            }
            newDots[i] = dot.getBaby();
            i++;
        }
        Population.#dots = newDots;
        Population.#gen++;
    }

    mutateBabies() {
        let i = 1;
        while (i < Population.#size) {
            Population.#dots[i].getBrain().mutate();
            i++;
        }
    }
}