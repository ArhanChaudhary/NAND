import Brain from './brain.js';
import Dot from './dot.js';
import Util from './util.js';
import AccelerationVector from './accelerationvector.js';

export default class Population {
    static #dots;
    static #newBrainDirections;
    static #gen;
    static #size;
    static #fitnessCache;
    static #brainSize;

    constructor(size, brainSize) {
        let i = 0;
        Population.#brainSize = brainSize;
        Population.#gen = 1;
        Population.#size = size;
        Population.#fitnessCache = new Array(Population.#size);
        Population.#dots = new Array(Population.#size);
        Population.#newBrainDirections = new Array(Population.#size - 1);
        while (i < Population.#size) {
            Population.#dots[i] = new Dot(new Brain());
            i++;
        }
        i = 0;
        while (i < Population.#size - 1) {
            Population.#newBrainDirections[i] = new Array(Population.#brainSize);
            i++;
        }
    }

    update(onlyBest) {
        let i = 0;
        let dot;
        if (!onlyBest) {
            while (i < Population.#size) {
                dot = Population.#dots[i];
                dot.update();
                dot.show();
                i++;
            }
        } else {
            while (i < Population.#size) {
                dot = Population.#dots[i];
                dot.update();
                i++;
            }
            Population.#dots[0].show();
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
        let selectionSum;
        let selectionSumCoef;
        let randFitness;
        let randFitnessCoef;
        let fitnessSum = 0;
        let fitnessSumCoef = 0;
        let directions;
        let newDirections;
        let scaleCache;

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
            Dot.setMinStep(bestDot.getBrain().getStep());
        }

        i = 0;
        while (i < Population.#size - 1) {
            randFitness = Math.abs(Util.random());
            randFitnessCoef = 32767;
            if (!(fitnessSumCoef === 0)) {
                scaleCache = Math.floor(32767 / fitnessSumCoef);
                while (randFitnessCoef > fitnessSumCoef) {
                    // fitnessSumCoef = 296, randFitnessCoef = 32698
                    // this results in randFitnessCoef = 297 which is out of bounds
                    randFitnessCoef = Math.floor(Math.abs(Util.random()) / scaleCache);
                }
            } else {
                randFitnessCoef = 0;
            }
            if (randFitnessCoef === fitnessSumCoef) {
                scaleCache = Math.floor(32767 / fitnessSum);
                while (randFitness >= fitnessSum) {
                    // same with this it can also go out of bounds
                    randFitness = Math.floor(Math.abs(Util.random()) / scaleCache);
                }
            }
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
            directions = dot.getBrain().getDirections();
            newDirections = Population.#newBrainDirections[i];
            j = 0;
            while (j < Population.#brainSize) {
                if ((Util.random() & 32512) !== 0) {
                    newDirections[j] = directions[j];
                } else {
                    newDirections[j] = AccelerationVector.random();
                }
                j++;
            }
            i++;
        }
        i = 0;
        while (i < Population.#size) {
            directions = Population.#dots[i].getBrain().getDirections();
            Population.#dots[i].instantiate();
            Population.#dots[i].getBrain().instantiate();
            if (i !== 0) {
                newDirections = Population.#newBrainDirections[i - 1];
            } else {
                newDirections = bestDot.getBrain().getDirections();
            }
            j = 0;
            while (j < Population.#brainSize) {
                directions[j] = newDirections[j];
                j++;
            }
            i++;
        }
        Population.#gen++;
    }
}