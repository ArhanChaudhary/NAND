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
        // this.#newDots[0] = this.#getBestDot();
        // this.#newDots[0].setBest();
        // for (let i = 1; i < this.#newDots.length; i++) {
        //     const parent = this.#selectParent();
        //     this.#newDots[i] = new Dot(parent.getBrain());
        // }
        // this.#dots = this.#newDots;
        this.calculateFitnessSum();
        for (let i = 0; i < this.#dots.length; i++) {
            this.#dots[i] = this.selectParent().getChild();
        }
        this.#gen++;
    }

    calculateFitnessSum() {
        this.#fitnessSum = 0;
        for (let dot of this.#dots) {
            this.#fitnessSum += dot.getFitness();
        }

    }

    selectParent() {
        let rand = Math.random() * sum;
        let sum = 0;
        for (let dot of this.#dots) {
            sum += dot.getFitness();
            if (sum > rand) return dot;
        }
        return null;
    }
}