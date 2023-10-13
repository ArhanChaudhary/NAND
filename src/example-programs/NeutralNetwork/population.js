import Dot from './dot.js';

export default class Population {
    #dots;
    #fitnessSum;
    #gen = 1;
    #bestDot = 0;
    #minStep = 32767;

    constructor(size) {
        this.#dots = new Array(size);
        for (let i = 0; i < this.#dots.length; i++) {
            this.#dots[i] = new Dot();
        }
        this.#dots[0].setIsBest(true);
    }

    show() {
        for (let i = 1; i < this.#dots.length; i++) {
            this.#dots[i].show();
        }
        this.#dots[0].show();
    }

    update() {
        for (let dot of this.#dots) {
            if (dot.getBrain().getStep() > this.#minStep) {
                dot.setDead(true);
            } else {
                dot.update();
            }
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
        this.setIsBest();
        this.calculateFitnessSum();

        newDots[0] = this.#dots[this.#bestDot].getBaby();
        newDots[0].setIsBest(true);
        for (let i = 1; i < newDots.length; i++) {
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
        return this.#dots[0];
    }

    mutateBabies() {
        for (let i = 1; i < this.#dots.length; i++) {
            this.#dots[i].getBrain().mutate();
        }
    }

    setIsBest() {
        let max = 0;
        let maxIndex = 0;
        for (let i = 0; i < this.#dots.length; i++) {
            if (this.#dots[i].getFitness() > max) {
                max = this.#dots[i].getFitness();
                maxIndex = i;
            }
        }
        console.log("Best dot fitness: ",  this.#dots[maxIndex].getFitness(), new Date());
        this.#bestDot = maxIndex;

        if (this.#dots[this.#bestDot].checkReachedGoal()) {
            this.#minStep = this.#dots[this.#bestDot].getBrain().getStep();
        }
    }
}