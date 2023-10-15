import Dot from './dot.js';

export default class Population {
    #dots;
    #fitnessSum;
    static #gen;
    static #bestDot;
    static #minStep;
    static #size;

    static init() {
        Population.#gen = 1;
        Population.#bestDot = 0;
        Population.#minStep = 32767;

        Population.#size = 75;
    }

    constructor() {
        this.#dots = new Array(Population.#size);
        let i = 0;
        while (i < Population.#size) {
            this.#dots[i] = new Dot();
            i++;
        }
    }

    show() {
        for (let i = 1; i < this.#dots.length; i++) {
            this.#dots[i].show();
        }
        this.#dots[0].show();
    }

    update() {
        for (let dot of this.#dots) {
            if (dot.getBrain().getStep() > Population.#minStep) {
                dot.setDead(true);
            } else {
                dot.update();
            }
        }
    }

    allDotsDead() {
        for (let dot of this.#dots) {
            if (!dot.getDead() && !dot.checkReachedGoal()) return false;
        }
        return true;
    }

    naturalSelection() {
        let max = 0;
        let maxIndex = 0;
        this.#fitnessSum = 0;
        for (let i = 0; i < this.#dots.length; i++) {
            const dotFitness = this.#dots[i].calculateFitness();
            if (dotFitness > max) {
                max = dotFitness;
                maxIndex = i;
            }
            this.#fitnessSum += dotFitness;
        }
        Population.#bestDot = maxIndex;

        if (this.#dots[Population.#bestDot].checkReachedGoal()) {
            Population.#minStep = this.#dots[Population.#bestDot].getBrain().getStep();
        }

        const newDots = new Array(this.#dots.length);
        newDots[0] = this.#dots[Population.#bestDot].getBaby();
        for (let i = 1; i < newDots.length; i++) {
            newDots[i] = this.selectParent().getBaby();
        }
        this.#dots = newDots;
        Population.#gen++;
    }

    selectParent() {
        let rand = Math.random() * this.#fitnessSum;
        let sum = 0;
        for (let dot of this.#dots) {
            sum += dot.calculateFitness();
            if (sum > rand) return dot;
        }
        return this.#dots[0];
    }

    mutateBabies() {
        for (let i = 1; i < this.#dots.length; i++) {
            this.#dots[i].getBrain().mutate();
        }
    }
}