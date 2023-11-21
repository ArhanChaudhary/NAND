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

        remainingExtendedHeap = Util.add(remainingHeap, 8192);
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
        Population.#populationCount = Util.min(
            Util.divide(Util.sub(Util.add(remainingExtendedHeap, brainSize), 3), Util.add(Util.add(diff, brainSize), 5)),
            Util.divide(Util.sub(remainingHeap, 5), Util.add(diff, 3))
        );
        Population.#fitnessCache = new Array(Population.#populationCount);
        Population.#dots = new Array(Population.#populationCount);
        Population.#dots[0] = dot;
        i = 1;
        while (Util.lt(i, Population.#populationCount)) {
            Population.#dots[i] = new Dot();
            i = Util.add(i, 1);
        }
        i = 0;

        // auxilliary memory
        Population.#newBrainDirections = new Array(Util.sub(Population.#populationCount, 1));
        while (Util.lt(i, Util.sub(Population.#populationCount, 1))) {
            Population.#newBrainDirections[i] = new Array(Population.#brainSize);
            i = Util.add(i, 1);
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
        while (Util.lt(i, Population.#populationCount)) {
            dot = Population.#dots[i];
            dot.update(Util.not(Population.#onlyBest) | Util.eq(i, 0), firstPairComponent);
            i = Util.add(i, 1);
        }
    }

    static allDotsDead() {
        let i = 0;
        let dot;
        while (Util.lt(i, Population.#populationCount)) {
            dot = Population.#dots[i];
            if (Util.not(dot.getDead()))
                return 0;
            i = Util.add(i, 1);
        }
        return Util.neg(1);
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
        if (Util.eq(minStep, 32767)) {
            minStep = Population.#brainSize;
        }
        dynamicMutationRateTimes32 = Util.mult(Util.min(1000, Util.divide(1530, minStep)), 32);
        Population.#bestDotFitness = Util.neg(1);
        while (Util.lt(i, Population.#populationCount)) {
            dot = Population.#dots[i];
            dotFitness = dot.calculateFitness();
            Population.#fitnessCache[i] = dotFitness;
            if (Util.gt(dotFitness, Population.#bestDotFitness)) {
                Population.#bestDotFitness = dotFitness;
                bestDot = dot;
            }
            fitnessSum = Util.add(fitnessSum, dotFitness);
            if (Util.lt(fitnessSum, 0)) {
                fitnessSum = Util.add(fitnessSum, Util.not(32767));
                fitnessSumCoef = Util.add(fitnessSumCoef, 1);
            }
            i = Util.add(i, 1);
        }

        if (bestDot.getReachedGoal()) {
            brain = bestDot.getBrain();
            Dot.setMinStep(brain.getStep());
        }

        i = 0;
        while (Util.lt(i, Util.sub(Population.#populationCount, 1))) {
            if (Util.eq(fitnessSumCoef, 0)) {
                randFitnessCoef = 0;
            } else {
                scaleCache = Util.divide(32767, fitnessSumCoef);
                randFitnessCoef = 32767;
                while (Util.gt(randFitnessCoef, fitnessSumCoef)) {
                    // fitnessSumCoef = 296, randFitnessCoef = 32698
                    // this results in randFitnessCoef = 297 which is out of bounds
                    randFitnessCoef = Util.divide(Util.abs(Util.random()), scaleCache);
                }
            }
            randFitness = Util.abs(Util.random());
            if (Util.eq(randFitnessCoef, fitnessSumCoef)) {
                if (Util.eq(fitnessSum, 0)) {
                    randFitness = 0;
                } else {
                    scaleCache = Util.divide(32767, fitnessSum);
                    while (Util.gt(randFitness, fitnessSum)) {
                        // same with this it can also go out of bounds
                        randFitness = Util.divide(Util.abs(Util.random()), scaleCache);
                    }
                }
            }
            selectionSum = 0;
            selectionSumCoef = 0;
            j = 0;
            while (Util.lt(j, Population.#populationCount)) {
                selectionSum = Util.add(selectionSum, Population.#fitnessCache[j]);
                if (Util.lt(selectionSum, 0)) {
                    selectionSum = Util.add(selectionSum, Util.not(32767));
                    selectionSumCoef = Util.add(selectionSumCoef, 1);
                }
                if (Util.gt(selectionSumCoef, randFitnessCoef) | (Util.eq(selectionSumCoef, randFitnessCoef) & Util.gt(selectionSum, randFitness))) {
                    dot = Population.#dots[j];
                    j = Population.#populationCount;
                }
                j = Util.add(j, 1);
            }
            brain = dot.getBrain();
            directions = brain.getDirections();
            newDirections = Population.#newBrainDirections[i];
            mutated = 0;
            j = 0;
            while (Util.lt(j, Population.#brainSize)) {
                // scaleCache = Util.divide(32767, 1000); = 32
                randTo32000 = Util.abs(Util.random());
                while (Util.not(Util.lt(randTo32000, 32000))) {
                    randTo32000 = Util.abs(Util.random());
                }
                if (Util.lt(randTo32000, dynamicMutationRateTimes32)) {
                    newDirections[j] = AccelerationVectorPair.random();
                    mutated = Util.neg(1);
                } else {
                    newDirections[j] = directions[j];
                }
                j = Util.add(j, 1);
            }
            if (Util.not(mutated)) {
                scaleCache = Util.divide(32767, Population.#brainSize);
                randToBrainSize = Population.#brainSize;
                // randToBrainSize can be negative Util.abs does not guarantee positive (-32768)
                while (Util.not(Util.gt(randToBrainSize, Util.neg(1)) & Util.lt(randToBrainSize, Population.#brainSize))) {
                    randToBrainSize = Util.divide(Util.abs(Util.random()), scaleCache);
                }
                newDirections[randToBrainSize] = AccelerationVectorPair.random();
            }
            i = Util.add(i, 1);
        }
        i = 0;
        while (Util.lt(i, Population.#populationCount)) {
            dot = Population.#dots[i];
            brain = dot.getBrain();
            directions = brain.getDirections();
            dot.instantiate();
            brain.instantiate();
            if (Util.eq(i, 0)) {
                brain = bestDot.getBrain();
                newDirections = brain.getDirections();
            } else {
                newDirections = Population.#newBrainDirections[Util.sub(i, 1)];
            }
            j = 0;
            while (Util.lt(j, Population.#brainSize)) {
                directions[j] = newDirections[j];
                j = Util.add(j, 1);
            }
            i = Util.add(i, 1);
        }
        Util.clearScreen();
        Population.#gen = Util.add(Population.#gen, 1);
    }
}