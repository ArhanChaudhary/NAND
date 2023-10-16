import Dot from './dot.js';
import Util from './util.js';

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
        let selectionSum;
        let selectionSumCoef;
        let randFitness;
        let randFitnessCoef;
        let fitnessSum = 0;
        let fitnessSumCoef = 0;
        while (i < Population.#size) {
            dot = Population.#dots[i];
            dotFitness = dot.calculateFitness();
            Population.#fitnessCache[i] = dotFitness;
            if (dotFitness > bestFitness) {
                bestFitness = dotFitness;
                bestDot = dot;
            }
            fitnessSum += dotFitness;
            if (fitnessSum >= 32768) {
                fitnessSum -= 65536;
            }
            if (fitnessSum < 0) {
                fitnessSum = fitnessSum + 32767 + 1;
                fitnessSumCoef++;
            }
            i++;
        }

        if (bestDot.getReachedGoal()) {
            Population.#minStep = bestDot.getBrain().getStep();
        }

        newDots[0] = bestDot.getBaby();
        i = 1;
        while (i < Population.#size) {
            randFitness = Util.random();
            if (randFitness >= 32768) {
                randFitness -= 65536;
            }
            randFitness = Math.floor(Math.abs(randFitness) / Math.floor(32767 / fitnessSum));
            randFitnessCoef = Util.random();
            if (randFitnessCoef >= 32768) {
                randFitnessCoef -= 65536;
            }
            randFitnessCoef = Math.floor(Math.abs(randFitnessCoef) / Math.floor(32767 / fitnessSumCoef));
            selectionSum = 0;
            selectionSumCoef = 0;
            j = 0;
            while (j < Population.#size) {
                selectionSum += Population.#fitnessCache[j];
                if (selectionSum >= 32768) {
                    selectionSum -= 65536;
                }
                if (selectionSum < 0) {
                    selectionSum = selectionSum + 32767 + 1;
                    selectionSumCoef++;
                }
                if (selectionSumCoef > randFitnessCoef || (selectionSumCoef === randFitnessCoef && selectionSum > randFitness)) {
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
}