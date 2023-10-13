import Dot from './dot.js';

export default class Population {
    #dots;
    #fitnessSum;
    #gen = 1;

    constructor(size) {
        this.#dots = new Array(size);
        for (let i = 0; i < this.#dots.length; i++) {
            this.#dots[i] = new Dot();
        }
    }

    show() {
        for (let dot of this.#dots) {
            dot.show();
        }
    }

    update() {
        for (let dot of this.#dots) {
            dot.update();
        }
    }

    calculateFitness() {
        for (let dot of this.#dots) {
            dot.calculateFitness();
        }
    }

    allDotsDead() {
        for (let dot of this.#dots) {
            if (!dot.getDead() && !dot.checkReachedGoal()) return false;
        }
        return true;
    }

    naturalSelection() {
        const newDots = new Array(this.#dots.length);
        this.calculateFitnessSum();
        for (let i = 0; i < newDots.length; i++) {
            newDots[i] = this.selectParent().getBaby();
        }
        this.#dots = newDots;
        this.#gen++;
    }

    calculateFitnessSum() {
        this.#fitnessSum = 0;
        for (let dot of this.#dots) {
            this.#fitnessSum += dot.getFitness();
        }

    }

    selectParent() {
        let rand = Math.random() * this.#fitnessSum;
        let sum = 0;
        for (let dot of this.#dots) {
            sum += dot.getFitness();
            if (sum > rand) return dot;
        }
        throw new Error();
    }

    mutateBabies() {
        for (let i = 1; i < this.#dots.length; i++) {
            this.#dots[i].getBrain().mutate();
        }
    }
}