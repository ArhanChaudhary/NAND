import Dot from './dot.js';
import Util from './util.js';
import AccelerationVectorPair from './accelerationvectorpair.js';

export default class Population {
    static #dots;
    static #fitnessCache;
    static #bestDotFitness;
    static #newBrainDirections;
    static #gen;
    static #populationCount;
    static #brainSize;
    static #onlyBest;
    static #allocatingString;

    static init() {
        // Population.#dots = null;
        Population.#allocatingString = "Allocating dot memory...";
    }

    static config(brainSize, onlyBest, initialBestDotFitness) {
        let i = 0;
        let dot;
        let brain;
        let directions;
        let diff;
        let remainingExtendedHeap;
        let remainingHeap;
        console.log(Population.#allocatingString);
        Population.#gen = 1;
        Population.#brainSize = brainSize;
        Population.#onlyBest = onlyBest;
        Population.#bestDotFitness = initialBestDotFitness;

        dot = new Dot();
        brain = dot.getBrain();
        directions = brain.getDirections();
        // hardcoded values, update whenever
        diff = 96;
        remainingHeap = 9530;

        remainingExtendedHeap = remainingHeap + 8192;
        /*
        // populationCount upper bound

        // dots
        populationCount + 2
        // dots memory
        + populationCount * diff
        // fitnessCache
        + populationCount + 2
        // newBrainDirections
        + (populationCount - 1) + 2
        // newBrainDirections memory
        + (populationCount - 1) * (brainSize + 2)
        // remaining space
        = remainingExtendedHeap

        populationCount + 2 + populationCount * diff + populationCount + 2 + (populationCount - 1) + 2 + (populationCount - 1) * (brainSize + 2) = remainingExtendedHeap
        p + 2 + pd + p + 2 + p - 1 + 2 + (p - 1) * (b + 2) = remainingExtendedHeap
        p + 2 + pd + p + 2 + p - 1 + 2 + pb + 2p - b - 2 = remainingExtendedHeap

        p + pd + p + p + pb + p + p = remainingExtendedHeap - 3 + b
        p(1 + d + 1 + 1 + b + 1 + 1) = remainingExtendedHeap - 3 + b
        p = (remainingExtendedHeap + b - 3) / (d + b + 5)

        // populationCount lower bound

        // dots
        populationCount + 2
        // dots memory
        + populationCount * diff
        // fitnessCache
        + populationCount + 2
        // newBrainDirections
        + (populationCount - 1) + 2
        // remaining space
        = remainingHeap

        populationCount + 2 + populationCount * diff + populationCount + 2 + (populationCount - 1) + 2 = remainingHeap
        p + 2 + pd + p + 2 + p - 1 + 2 = remainingHeap
        p + pd + p + p = remainingHeap - 5
        p(1 + d + 1 + 1) = remainingHeap - 5
        p = (remainingHeap - 5) / (d + 3)
        */
        Population.#populationCount = Math.min(
            Util.divide(remainingExtendedHeap + brainSize + 1, diff + brainSize + 3),
            Util.divide(remainingHeap - 5, diff + 3)
        );
        Population.#fitnessCache = new Array(Population.#populationCount);
        Population.#dots = new Array(Population.#populationCount);
        Population.#dots[0] = dot;
        i = 1;
        while (i < Population.#populationCount) {
            Population.#dots[i] = new Dot();
            i++;
        }
        i = 0;

        // auxilliary memory
        Population.#newBrainDirections = new Array(Population.#populationCount - 1);
        while (i < Population.#populationCount - 1) {
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
        while (i < Population.#populationCount) {
            dot = Population.#dots[i];
            dot.update(!Population.#onlyBest || i == 0, firstPairComponent);
            i++;
        }
    }

    static allDotsDead() {
        let i = 0;
        let dot;
        while (i < Population.#populationCount) {
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
        let brain;
        let dotFitness;
        let i = 0;
        let j;
        let selectionSum;
        let selectionSumCoef;
        let randFitness;
        let randFitnessCoef;
        let fitnessSum = 0;
        let fitnessSumCoef = 0;
        let randTo32000;
        let randToBrainSize;
        let directions;
        let newDirections;
        let scaleCache;
        let mutated;
        let dynamicMutationRateTimes32;
        let minStep;

        minStep = Dot.getMinStep();
        if (minStep == 32767) {
            minStep = Population.#brainSize;
        }
        dynamicMutationRateTimes32 = Math.min(1000, Util.divide(1530, minStep)) * 32;
        Population.#bestDotFitness = -1;
        while (i < Population.#populationCount) {
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
            brain = bestDot.getBrain();
            Dot.setMinStep(brain.getStep());
        }

        i = 0;
        while (i < Population.#populationCount - 1) {
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
            while (j < Population.#populationCount) {
                selectionSum += Population.#fitnessCache[j];
                if (selectionSum >= 32768) {
                    selectionSum = selectionSum - 32768;
                    selectionSumCoef++;
                }
                if (selectionSumCoef > randFitnessCoef || (selectionSumCoef == randFitnessCoef && selectionSum > randFitness)) {
                    dot = Population.#dots[j];
                    j = Population.#populationCount;
                }
                j++;
            }
            brain = dot.getBrain();
            directions = brain.getDirections();
            newDirections = Population.#newBrainDirections[i];
            mutated = false;
            j = 0;
            while (j < Population.#brainSize) {
                // scaleCache = Util.divide(32767, 1000); = 32
                randTo32000 = Util.abs(Util.random());
                while (!(randTo32000 < 32000)) {
                    randTo32000 = Util.abs(Util.random());
                }
                if (randTo32000 < dynamicMutationRateTimes32) {
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
        while (i < Population.#populationCount) {
            dot = Population.#dots[i];
            brain = dot.getBrain();
            directions = brain.getDirections();
            dot.instantiate();
            brain.instantiate();
            if (i == 0) {
                brain = bestDot.getBrain();
                newDirections = brain.getDirections();
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