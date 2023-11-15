import Dot from './dot.js';
import Util from './util.js';
import AccelerationVectorPair from './accelerationvectorpair.js';

export default class Population {
    static #dots;
    static #fitnessCache;
    static #bestDotFitness;
    static #dynamicMutationRate;
    static #newBrainDirections;
    static #gen;
    static #size;
    static #brainSize;
    static #onlyBest;
    static #allocatingString;

    static init() {
        // Population.#dots = null;
        Population.#allocatingString = "Allocating dot memory...";
    }

    static config(size, brainSize, onlyBest, initialBestDotFitness) {
        let i = 0;
        console.log(Population.#allocatingString);
        Population.#gen = 1;
        Population.#size = size;
        Population.#brainSize = brainSize;
        Population.#onlyBest = onlyBest;
        Population.#bestDotFitness = initialBestDotFitness;
        Population.#dynamicMutationRate = Util.divide(1530, brainSize);

        Population.#dots = new Array(Population.#size);
        while (i < Population.#size) {
            Population.#dots[i] = new Dot();
            i++;
        }
        i = 0;

        Population.#fitnessCache = new Array(Population.#size);

        // auxilliary memory
        Population.#newBrainDirections = new Array(Population.#size - 1);
        while (i < Population.#size - 1) {
            Population.#newBrainDirections[i] = new Array(Population.#brainSize);
            i++;
        }
    }

    static getGen() {
        return Population.#gen;
    }

    static getBestDotFitness() {
        return Population.#bestDotFitness;
    }

    static update(firstPairComponent) {
        let i = 0;
        let dot;
        while (i < Population.#size) {
            dot = Population.#dots[i];
            dot.update(!Population.#onlyBest || i == 0, firstPairComponent);
            i++;
        }
    }

    static allDotsDead() {
        let i = 0;
        let dot;
        while (i < Population.#size) {
            dot = Population.#dots[i];
            if (!dot.getDead())
                return 0;
            i++;
        }
        return -1;
    }

    static naturalSelection() {
        let dot;
        let bestDot;
        let dotFitness;
        let i = 0;
        let j;
        let selectionSum;
        let selectionSumCoef;
        let randFitness;
        let randFitnessCoef;
        let fitnessSum = 0;
        let fitnessSumCoef = 0;
        let randTo1000;
        let randToBrainSize;
        let directions;
        let newDirections;
        let scaleCache;
        let mutated;

        Population.#bestDotFitness = -1;
        while (i < Population.#size) {
            dot = Population.#dots[i];
            dotFitness = dot.calculateFitness();
            Population.#fitnessCache[i] = dotFitness;
            if (dotFitness > Population.#bestDotFitness) {
                Population.#bestDotFitness = dotFitness;
                bestDot = dot;
            }
            fitnessSum += dotFitness;
            if (fitnessSum >= 32768) {
                fitnessSum = fitnessSum - 32768;
                fitnessSumCoef++;
            }
            i++;
        }

        if (bestDot.getReachedGoal()) {
            Dot.setMinStep(bestDot.getBrain().getStep());
        }

        i = 0;
        while (i < Population.#size - 1) {
            if (fitnessSumCoef == 0) {
                randFitnessCoef = 0;
            } else {
                scaleCache = Util.divide(32767, fitnessSumCoef);
                randFitnessCoef = 32767;
                while (randFitnessCoef > fitnessSumCoef) {
                    // fitnessSumCoef = 296, randFitnessCoef = 32698
                    // this results in randFitnessCoef = 297 which is out of bounds
                    randFitnessCoef = Util.divide(Util.abs(Util.random()), scaleCache);
                }
            }
            randFitness = Util.abs(Util.random());
            if (randFitnessCoef == fitnessSumCoef) {
                if (fitnessSum == 0) {
                    randFitness = 0;
                } else {
                    scaleCache = Util.divide(32767, fitnessSum);
                    while (randFitness > fitnessSum) {
                        // same with this it can also go out of bounds
                        randFitness = Util.divide(Util.abs(Util.random()), scaleCache);
                    }
                }
            }
            selectionSum = 0;
            selectionSumCoef = 0;
            j = 0;
            while (j < Population.#size) {
                selectionSum += Population.#fitnessCache[j];
                if (selectionSum >= 32768) {
                    selectionSum = selectionSum - 32768;
                    selectionSumCoef++;
                }
                if (selectionSumCoef > randFitnessCoef || (selectionSumCoef == randFitnessCoef && selectionSum > randFitness)) {
                    dot = Population.#dots[j];
                    j = Population.#size;
                }
                j++;
            }
            directions = dot.getBrain().getDirections();
            newDirections = Population.#newBrainDirections[i];
            mutated = false;
            j = 0;
            while (j < Population.#brainSize) {
                // scaleCache = Util.divide(32767, 1000); = 32
                randTo1000 = 1000;
                while (!(randTo1000 < 1000)) {
                    randTo1000 = Util.divide(Util.abs(Util.random()), 32);
                }
                if (randTo1000 < Population.#dynamicMutationRate) {
                    newDirections[j] = AccelerationVectorPair.random();
                    mutated = true;
                } else {
                    newDirections[j] = directions[j];
                }
                j++;
            }
            if (!mutated) {
                scaleCache = Util.divide(32767, Population.#brainSize);
                randToBrainSize = Population.#brainSize;
                // randToBrainSize can be negative Math.abs does not guarantee positive (-32768)
                while (!((randToBrainSize > -1) && (randToBrainSize < Population.#brainSize))) {
                    randToBrainSize = Util.divide(Util.abs(Util.random()), scaleCache);
                }
                newDirections[randToBrainSize] = AccelerationVectorPair.random();
            }
            i++;
        }
        i = 0;
        while (i < Population.#size) {
            directions = Population.#dots[i].getBrain().getDirections();
            Population.#dots[i].instantiate();
            Population.#dots[i].getBrain().instantiate();
            if (i == 0) {
                newDirections = bestDot.getBrain().getDirections();
            } else {
                newDirections = Population.#newBrainDirections[i - 1];
            }
            j = 0;
            while (j < Population.#brainSize) {
                directions[j] = newDirections[j];
                j++;
            }
            i++;
        }
        Util.clearScreen();
        Population.#gen++;
    }
}