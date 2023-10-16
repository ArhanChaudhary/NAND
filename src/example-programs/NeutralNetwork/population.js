import Dot from './dot.js';

export default class Population {
    static #dots;
    static #gen;
    static #minStep;
    static #size;
    static #fitnessCache;

    constructor(size) {
        let i = 0;
        Population.#gen = 1;
        Population.#minStep = 32767;
        Population.#size = size;
        Population.#fitnessCache = new Array(Population.#size);
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
            if (!dot.getDead())
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
            Population.#fitnessCache[i] = dotFitness;
            if (dotFitness > bestFitness) {
                bestFitness = dotFitness;
                bestDot = dot;
            }
            fitnessSum = dotFitness + fitnessSum;
            i++;
        }

        if (bestDot.getReachedGoal()) {
            Population.#minStep = bestDot.getBrain().getStep();
        }

        newDots[0] = bestDot.getBaby();
        i = 1;
        while (i < Population.#size) {
            rand = Math.random() * fitnessSum;
            sum = 0;
            j = 0;
            while (j < Population.#size) {
                sum += Population.#fitnessCache[j];
                if (sum > rand) {
                    dot = Population.#dots[j];
                    j = Population.#size;
                }
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