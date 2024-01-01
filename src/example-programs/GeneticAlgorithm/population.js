import Dot from "./dot.js";
import Util from "./util.js";
import AccelerationVectorPair from "./accelerationvectorpair.js";

const div = Util.div;
const gt = Util.gt;
const neg = Util.neg;
const not = Util.not;
const add = Util.add;
const lt = Util.lt;
const eq = Util.eq;
const abs = Util.abs;
const sub = Util.sub;
const max = Util.max;
const mult = Util.mult;
const min = Util.min;
const random = Util.random;
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
  static #escapeString;

  static init() {
    // Population.#dots = null;
    Population.#allocatingString = "Allocating dot memory...";
    Population.#escapeString =
      "Hold escape in the simulation to open the menu.";
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
    console.log(Population.#escapeString);
    Population.#gen = 1;
    Population.#brainSize = brainSize;
    Population.#onlyBest = onlyBest;
    Population.#bestDotFitness = initialBestDotFitness;

    dot = new Dot();
    brain = dot.getBrain();
    directions = brain.getDirections();
    // hardcoded values, update whenever
    diff = brainSize + 18;
    remainingHeap = 9530;

    remainingExtendedHeap = add(remainingHeap, 8192);
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
        + (populationCount - 1) * (brainSize + 3)
        // remaining space
        = remainingExtendedHeap

        populationCount + 2 + populationCount * diff + populationCount + 2 + (populationCount - 1) + 2 + (populationCount - 1) * (brainSize + 3) = remainingExtendedHeap
        p + 2 + pd + p + 2 + p - 1 + 2 + (p - 1) * (b + 3) = remainingExtendedHeap
        p + 2 + pd + p + 2 + p - 1 + 2 + pb + 3p - b - 3 = remainingExtendedHeap

        p + pd + p + p + pb + p + p + p = remainingExtendedHeap - 2 + b
        p(1 + d + 1 + 1 + b + 1 + 1 + 1) = remainingExtendedHeap - 2 + b
        p = (remainingExtendedHeap + b - 2) / (d + b + 6)

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
    Population.#populationCount = min(
      div(
        sub(add(remainingExtendedHeap, brainSize), 2),
        add(add(diff, brainSize), 6)
      ),
      div(sub(remainingHeap, 5), add(diff, 3))
    );
    Population.#fitnessCache = new Array(Population.#populationCount);
    Population.#dots = new Array(Population.#populationCount);
    Population.#dots[0] = dot;
    i = 1;
    while (lt(i, Population.#populationCount)) {
      Population.#dots[i] = new Dot();
      i = add(i, 1);
    }
    i = 0;

    Population.#newBrainDirections = new Array(
      sub(Population.#populationCount, 1)
    );
    // auxilliary memory
    while (lt(i, sub(Population.#populationCount, 1))) {
      Population.#newBrainDirections[i] = new Array(
        add(Population.#brainSize, 1)
      );
      i = add(i, 1);
    }
  }

  static toggleOnlyBest() {
    Population.#onlyBest = not(Population.#onlyBest);
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
    while (lt(i, Population.#populationCount)) {
      dot = Population.#dots[i];
      dot.update(not(Population.#onlyBest) | eq(i, 0), firstPairComponent);
      i = add(i, 1);
    }
  }

  static allDotsDead() {
    let i = 0;
    let dot;
    while (lt(i, Population.#populationCount)) {
      dot = Population.#dots[i];
      if (not(dot.getDead())) return 0;
      i = add(i, 1);
    }
    return neg(1);
  }

  static naturalSelection() {
    let dot;
    let bestDot;
    let brain;
    let bestDotBrain;
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
    let randToMinStep;
    let directions;
    let newDirections;
    let scaleCache;
    let mutated;
    let dynamicMutationRateTimes32;
    let minStep;
    let dotMinStepCache = 0;

    // safe to set as 1 because 1) calcualteFitness return >= 1 and 2) bestDot can never be null after this loop
    Population.#bestDotFitness = 1;
    while (lt(i, Population.#populationCount)) {
      dot = Population.#dots[i];
      dotFitness = dot.calculateFitness();
      Population.#fitnessCache[i] = dotFitness;
      if (gt(dotFitness, Population.#bestDotFitness)) {
        Population.#bestDotFitness = dotFitness;
        bestDot = dot;
        // ensures brain and bestDotBrain is only defined when necessary
      } else if (eq(dotFitness, Population.#bestDotFitness)) {
        brain = dot.getBrain();
        bestDotBrain = bestDot.getBrain(); // doesnt run when bestDot is null
        if (lt(brain.getStep(), bestDotBrain.getStep())) {
          bestDot = dot;
        }
      }
      fitnessSum = add(fitnessSum, dotFitness);
      if (lt(fitnessSum, 0)) {
        fitnessSum = add(fitnessSum, not(32767));
        fitnessSumCoef = add(fitnessSumCoef, 1);
      }
      i = add(i, 1);
    }

    if (bestDot.getReachedGoal()) {
      brain = bestDot.getBrain();
      dotMinStepCache = brain.getStep();
      Dot.setMinStep(dotMinStepCache);
    }

    i = 0;
    while (lt(i, sub(Population.#populationCount, 1))) {
      if (eq(fitnessSumCoef, 0)) {
        randFitnessCoef = 0;
      } else {
        scaleCache = div(32767, fitnessSumCoef);
        randFitnessCoef = 32767;
        while (gt(randFitnessCoef, fitnessSumCoef)) {
          // fitnessSumCoef = 296, randFitnessCoef = 32698
          // this results in randFitnessCoef = 297 which is out of bounds
          randFitnessCoef = div(abs(random()), scaleCache);
        }
      }
      randFitness = abs(random());
      if (eq(randFitnessCoef, fitnessSumCoef)) {
        if (eq(fitnessSum, 0)) {
          randFitness = 0;
        } else {
          scaleCache = div(32767, fitnessSum);
          while (gt(randFitness, fitnessSum)) {
            // same with this it can also go out of bounds
            randFitness = div(abs(random()), scaleCache);
          }
        }
      }
      selectionSum = 0;
      selectionSumCoef = 0;
      j = 0;
      while (lt(j, Population.#populationCount)) {
        selectionSum = add(selectionSum, Population.#fitnessCache[j]);
        if (lt(selectionSum, 0)) {
          selectionSum = add(selectionSum, not(32767));
          selectionSumCoef = add(selectionSumCoef, 1);
        }
        if (
          gt(selectionSumCoef, randFitnessCoef) |
          (eq(selectionSumCoef, randFitnessCoef) &
            gt(selectionSum, randFitness))
        ) {
          dot = Population.#dots[j];
          j = Population.#populationCount;
        }
        j = add(j, 1);
      }
      brain = dot.getBrain();
      directions = brain.getDirections();
      newDirections = Population.#newBrainDirections[i];
      if (dotMinStepCache == 0) {
        minStep = brain.getStep();
      } else {
        minStep = dotMinStepCache;
      }
      dynamicMutationRateTimes32 = mult(min(1000, div(1530, minStep)), 32);
      mutated = 0;
      j = 0;
      while (lt(j, minStep)) {
        // scaleCache = div(32767, 1000); = 32
        randTo32000 = abs(random());
        while (not(lt(randTo32000, 32000))) {
          randTo32000 = abs(random());
        }
        if (lt(randTo32000, dynamicMutationRateTimes32)) {
          newDirections[j] = AccelerationVectorPair.random();
          mutated = neg(1);
        } else {
          newDirections[j] = directions[j];
        }
        j = add(j, 1);
      }
      newDirections[Population.#brainSize] = minStep; // cache for later
      if (not(mutated)) {
        scaleCache = div(32767, minStep);
        randToMinStep = minStep;
        // randToMinStep can be negative abs does not guarantee positive (-32768)
        while (not(gt(randToMinStep, neg(1)) & lt(randToMinStep, minStep))) {
          randToMinStep = div(abs(random()), scaleCache);
        }
        newDirections[randToMinStep] = AccelerationVectorPair.random();
      }
      i = add(i, 1);
    }
    i = 0;
    while (lt(i, Population.#populationCount)) {
      dot = Population.#dots[i];
      brain = dot.getBrain();
      directions = brain.getDirections();
      dot.instantiate();
      brain.instantiate();
      j = 0;
      if (not(eq(i, 0))) {
        newDirections = Population.#newBrainDirections[sub(i, 1)];
        minStep = newDirections[Population.#brainSize];
      } else if (dot === bestDot) {
        minStep = 0;
      } else {
        brain = bestDot.getBrain();
        newDirections = brain.getDirections();
        minStep = Population.#brainSize;
      }
      while (lt(j, minStep)) {
        directions[j] = newDirections[j];
        j = add(j, 1);
      }
      i = add(i, 1);
    }
    Population.#gen = add(Population.#gen, 1);
  }

  static instantiateDots() {
    let i = 0;
    let dot;
    while (lt(i, Population.#populationCount)) {
      dot = Population.#dots[i];
      dot.instantiate();
      i = add(i, 1);
    }
  }
}
