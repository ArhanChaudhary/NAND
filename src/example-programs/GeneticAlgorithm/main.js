import Population from "./population.js";
import AccelerationVectorPair from "./accelerationvectorpair.js";
import Dot from "./dot.js";
import Util from "./util.js";
import Brain from "./brain.js";

export default class Main {
    static #initialX;
    static #initialY;
    static #goalX;
    static #goalY;
    static #onlyBest;
    static #isAdjacent;
    static #obstacles;
    static #floodQueue;
    static #floodQueueLength;
    static #floodDist;
    static #initialGoalDist;
    static #initialBestDotFitness;

    static #generationString;
    static #goalStepCountString;
    static #goalDistanceString;
    static #NAString;
    static #placeString;
    static #escString;
    static #precomputingString;

    static init() {
        let i = 0;
        Main.#generationString = "Generation: ";
        Main.#goalStepCountString = "Goal step count: ";
        Main.#goalDistanceString = "Goal distance: ";
        Main.#NAString = "NA";
        Main.#placeString = "Place obstacles with the arrow, enter, and delete keys.";
        Main.#escString = "Press esc to finish.";
        Main.#precomputingString = "Precomputing fitnesses...";
        Main.#floodQueue = new Array(100);
        Main.#obstacles = new Array(512);
        while (Util.lt(i, 512)) {
            Main.#obstacles[i] = 0;
            i = Util.add(i, 1);
        }
    }

    static async main() {
        let brainSize;
        let firstPairComponent = 0;
        Util.init();
        AccelerationVectorPair.init();
        Population.init();
        Main.init();

        Util.drawRectangle(70, 57, 442, 154);
        Util.setColor(0);
        Util.drawRectangle(72, 59, 440, 152);
        console.log("Welcome to my genetic algorithm simulation!");
        console.log("The objective is for dots to reach a goal in");
        console.log("as little steps as possible.");
        console.log("Press any key to start.");
        await new Promise(resolve => {
            function tmp() {
                if (Util.eq(Util.keyPressed(), 0)) {
                    Util.random();
                    setTimeout(tmp, 0);
                } else {
                    resolve();
                }
            }
            tmp();
        });
        Util.drawRectangle(70, 57, 442, 154);

        Main.#initialX = 10;
        Main.#initialY = 128;
        Main.#goalX = 500;
        Main.#goalY = 128;
        Main.#onlyBest = 0;
        await Main.selectObstacles();
        brainSize = Main.#initialGoalDist;
        Brain.config(brainSize);
        Dot.config(Main.#initialX, Main.#initialY, Main.#goalX, Main.#goalY, brainSize, Main.#obstacles);
        Population.config(brainSize, Main.#onlyBest, Main.#initialBestDotFitness);
        Main.refreshDisplay();
        window.interval = 25;
        async function tmp() {
            if (Population.allDotsDead()) {
                Population.naturalSelection();
                if (Util.eq(Util.keyPressed(), 140)) {
                    await Main.selectObstacles();
                }
                Main.refreshDisplay();
                firstPairComponent = 0;
            } else {
                firstPairComponent = Util.not(firstPairComponent);
                Population.update(firstPairComponent);
            }
            setTimeout(tmp, window.interval);
        }
        tmp();
    }

    static async selectObstacles() {
        let selectorX = 0;
        let selectorY = 0;
        let selectorIndex = 0;
        let key = 0;
        let drag = 0;
        let draggingEnter = 0;
        let i = 0;
        let i2 = 0;
        let allowUp;
        let allowDown;
        let allowRight;
        let allowLeft;
        while (Util.not(Util.gt(i, 511))) {
            if (Util.not(Util.eq(Main.#obstacles[i], Util.neg(1)))) {
                Main.#obstacles[i] = 0;
            }
            i = Util.add(i, 1);
        }
        console.log(Main.#placeString);
        console.log(Main.#escString);
        selectorX = 256;
        selectorY = 112;
        selectorIndex = 240;
        key = 1;
        while (Util.not(Util.eq(key, 140))) {
            await new Promise(resolve => {
                function tmp() {
                    if (Util.not(Util.gt(key, 0))) {
                        key = Util.keyPressed();
                        setTimeout(tmp, 0);
                    } else {
                        resolve();
                    }
                }
                tmp();
            });
            Util.setColor(Util.eq(Main.#obstacles[selectorIndex], Util.neg(1)));
            Util.drawRectangle(selectorX, selectorY, Util.add(selectorX, 15), Util.add(selectorY, 15));
            Util.setColor(Util.neg(1));
            if (Util.not(Util.eq(key, 140))) {
                Main.drawGoal();
                Util.drawRectangle(Util.sub(Main.#initialX, 1), Util.sub(Main.#initialY, 1), Util.add(Main.#initialX, 1), Util.add(Main.#initialY, 1));
                if (Util.eq(key, 130)) {
                    if (Util.not(Util.eq(selectorX, 0))) {
                        selectorX = Util.sub(selectorX, 16);
                        selectorIndex = Util.sub(selectorIndex, 1);
                    }
                } else if (Util.eq(key, 131)) {
                    if (Util.not(Util.eq(selectorY, 0))) {
                        selectorY = Util.sub(selectorY, 16);
                        selectorIndex = Util.sub(selectorIndex, 32);
                    }
                } else if (Util.eq(key, 132)) {
                    if (Util.not(Util.eq(selectorX, 496))) {
                        selectorX = Util.add(selectorX, 16);
                        selectorIndex = Util.add(selectorIndex, 1);
                    }
                } else if (Util.eq(key, 133)) {
                    if (Util.not(Util.eq(selectorY, 240))) {
                        selectorY = Util.add(selectorY, 16);
                        selectorIndex = Util.add(selectorIndex, 32);
                    }
                }
                Util.drawRectangle(selectorX, selectorY, Util.add(selectorX, 15), Util.add(selectorY, 15));
                Util.setColor(0);
                Util.drawRectangle(Util.add(selectorX, 1), Util.add(selectorY, 1), Util.add(selectorX, 14), Util.add(selectorY, 14));
                Util.setColor(Util.neg(1));
                Util.drawRectangle(Util.add(selectorX, 2), Util.add(selectorY, 2), Util.add(selectorX, 13), Util.add(selectorY, 13));
                if ((Util.eq(key, 128)) | (Util.eq(key, 129))) {
                    drag = Util.not(drag & Util.eq(draggingEnter, Util.eq(key, 128)));
                    draggingEnter = Util.eq(key, 128);
                    await new Promise(resolve => {
                        function tmp() {
                            if (Util.eq(key, 0)) {
                                resolve();
                            } else {
                                key = Util.keyPressed();
                                setTimeout(tmp, 0);
                            }
                        }
                        tmp();
                    });
                }
                if (drag) {
                    Main.#obstacles[selectorIndex] = draggingEnter;
                }
                if (Util.eq(key, 1)) {
                    // wait for key release
                    await new Promise(resolve => {
                        function tmp() {
                            if (Util.not(Util.eq(Util.keyPressed(), 0))) {
                                setTimeout(tmp, 0);
                            } else {
                                resolve();
                            }
                        }
                        tmp();
                    });
                    // wait for key press then hide
                    await new Promise(resolve => {
                        function tmp() {
                            if (Util.eq(Util.keyPressed(), 0)) {
                                setTimeout(tmp, 0);
                            } else {
                                resolve();
                            }
                        }
                        tmp();
                    });
                    Util.setColor(0);
                    Util.drawRectangle(40, 34, 480, 56);
                    Util.setColor(Util.neg(1));
                    Main.drawObstacles();
                    key = 2;
                } else {
                    key = 0;
                }
                await new Promise(resolve => setTimeout(resolve, 50));
            }
        }
        console.log(Main.#precomputingString);

        i = Main.getGridIndex(Main.#goalX, Main.#goalY);
        Main.#floodQueue[0] = i;
        Main.#floodQueueLength = 1;
        Main.#obstacles[i] = 1;
        while (Util.gt(Main.#floodQueueLength, 0)) {
            i = Main.#floodQueue[0];
            i2 = 1;
            while (Util.not(Util.eq(i2, Main.#floodQueueLength))) {
                Main.#floodQueue[Util.sub(i2, 1)] = Main.#floodQueue[i2];
                i2 = Util.add(i2, 1);
            }

            Main.#floodQueueLength = Util.sub(Main.#floodQueueLength, 1);
            Main.#floodDist = Main.#obstacles[i];
            allowUp = Util.gt(i, 31);
            allowDown = Util.lt(i, 480);
            allowRight = Util.not(Util.eq(i & 31, 31));
            allowLeft = Util.not(Util.eq(i & 31, 0));

            Main.#isAdjacent = Util.neg(1);
            if (allowUp) {
                Main.floodIndex(i, 1, 32);
            }

            if (allowRight) {
                Main.floodIndex(i, 32, Util.neg(1));
            }

            if (allowDown) {
                Main.floodIndex(i, Util.neg(1), Util.neg(32));
            }

            if (allowLeft) {
                Main.floodIndex(i, Util.neg(32), 1);
            }

            Main.#isAdjacent = 0;
            if (allowUp) {
                if (allowRight) {
                    Main.floodIndex(Util.sub(i, 31), Util.neg(1), 32);
                }

                if (allowLeft) {
                    Main.floodIndex(Util.sub(i, 33), 32, 1);
                }
            }

            if (allowDown) {
                if (allowRight) {
                    Main.floodIndex(Util.add(i, 33), Util.neg(32), Util.neg(1));
                }

                if (allowLeft) {
                    Main.floodIndex(Util.add(i, 31), 1, Util.neg(32));
                }
            }
        }

        i2 = Main.getGridIndex(Main.#initialX, Main.#initialY);
        Main.#initialGoalDist = Main.#obstacles[i2];
        i = 0;
        while (Util.lt(i, 512)) {
            if (Util.not(Util.eq(Main.#obstacles[i], Util.neg(1)) | Util.eq(Main.#obstacles[i], 0))) {
                Main.#obstacles[i] = Util.min(3276, Util.divide(32767, Main.#obstacles[i]));
                if (Util.eq(i, i2)) {
                    Main.#initialBestDotFitness = Main.#obstacles[i2];
                }
            } else if (Util.eq(i, i2)) {
                Main.#initialGoalDist = 200;
                Main.#initialBestDotFitness = 1;
            }
            i = Util.add(i, 1);
        }
    }

    static floodIndex(i, leftIndex, rightIndex) {
        let floodVal = 0;
        let penalty = 0;
        let topLeft = 0;
        let topRight = 0;
        let bottomLeft = 0;
        let bottomRight = 0;

        if (Main.#isAdjacent) {
            bottomLeft = Util.sub(i, leftIndex);
            bottomRight = Util.add(i, leftIndex);
            topLeft = Util.sub(bottomLeft, rightIndex);
            topRight = Util.sub(bottomRight, rightIndex);

            penalty = Util.min(
                Util.add(
                    Main.floodIndexOutOfBounds(i, bottomLeft) | Main.#obstacles[bottomLeft],
                    Main.floodIndexOutOfBounds(i, bottomRight) | Main.#obstacles[bottomRight]
                ),
                Util.add(
                    Main.floodIndexOutOfBounds(i, topLeft) | Main.#obstacles[topLeft],
                    Main.floodIndexOutOfBounds(i, topRight) | Main.#obstacles[topRight]
                )
            );
            i = Util.sub(i, rightIndex);
        } else {
            rightIndex = Main.floodIndexOutOfBounds(i, Util.add(i, rightIndex)) | Util.eq(Main.#obstacles[Util.add(i, rightIndex)], Util.neg(1));
            leftIndex = Main.floodIndexOutOfBounds(i, Util.add(i, leftIndex)) | Util.eq(Main.#obstacles[Util.add(i, leftIndex)], Util.neg(1));
            penalty = Util.add(leftIndex, rightIndex);
        }

        if (Util.eq(penalty, Util.neg(2))) {
            if (Main.#isAdjacent) {
                floodVal = Util.add(Main.#floodDist, 12);
            } else {
                floodVal = Util.add(Main.#floodDist, 65);
            }
        } else if (Util.eq(penalty, Util.neg(1))) {
            if (Main.#isAdjacent) {
                floodVal = Util.add(Main.#floodDist, 9);
            } else {
                // cant be ran because this will override Util.add(the, 13) case
                // it also isnt natural for dots to get past such an obstacle in a single diagonal step
                return;
            }
        } else {
            if (Main.#isAdjacent) {
                floodVal = Util.add(Main.#floodDist, 5);
            } else {
                floodVal = Util.add(Main.#floodDist, 7);
            }
        }

        if (Util.eq(Main.#obstacles[i], 0) | Util.gt(Main.#obstacles[i], floodVal)) {
            Main.#obstacles[i] = floodVal;
            Main.#floodQueue[Main.#floodQueueLength] = i;
            Main.#floodQueueLength = Util.add(Main.#floodQueueLength, 1);
        }
    }

    static floodIndexOutOfBounds(originIndex, newIndex) {
        return Util.lt(newIndex, 0) | Util.gt(newIndex, 511) |
                (Util.eq(originIndex & 31, 31) & Util.eq(newIndex & 31, 0)) |
                (Util.eq(originIndex & 31, 0) & Util.eq(newIndex & 31, 31));
    }

    static drawGoal() {
        Util.drawRectangle(Util.sub(Main.#goalX, 2), Util.sub(Main.#goalY, 2), Util.add(Main.#goalX, 2), Util.add(Main.#goalY, 2));
    }

    static drawObstacles() {
        let i = 0;
        let obstacleX;
        let obstacleY;

        while (Util.lt(i, 512)) {
            obstacleY = 0;
            obstacleX = i;
            while (Util.not(Util.lt(obstacleX, 32))) {
                obstacleX = Util.sub(obstacleX, 32);
                obstacleY = Util.add(obstacleY, 16);
            }
            obstacleX = Util.sub(i, Util.add(obstacleY, obstacleY));
            obstacleX = Util.add(obstacleX, obstacleX);
            obstacleX = Util.add(obstacleX, obstacleX);
            obstacleX = Util.add(obstacleX, obstacleX);
            obstacleX = Util.add(obstacleX, obstacleX);
            if (Util.eq(Main.#obstacles[i], Util.neg(1))) {
                Util.drawRectangle(obstacleX, obstacleY, Util.add(obstacleX, 15), Util.add(obstacleY, 15));
            }/* else if (Util.not(Util.eq(Main.#obstacles[i], 0))) {
                Util.drawText(Util.divide(32767, Main.#obstacles[i]), Util.add(obstacleX, 8), Util.add(obstacleY, 8));
            }*/
            i = Util.add(i, 1);
        }
    }

    static refreshDisplay() {
        let tmp;
        let bestDotFitness;
        let minStep = Dot.getMinStep();
        Main.drawGoal();
        Main.drawObstacles();
        console.log(Main.#generationString + Population.getGen());
        if (Util.eq(minStep, 32767)) {
            bestDotFitness = Population.getBestDotFitness();
            if (Util.eq(bestDotFitness, Util.neg(1)) | Util.eq(bestDotFitness, 1)) {
                tmp = Main.#NAString;
            } else {
                tmp = Util.divide(32767, bestDotFitness);
            }
            console.log(Main.#goalDistanceString + tmp);
        } else {
            console.log(Main.#goalStepCountString + minStep);
        }
    }

    static getGridIndex(posX, posY) {
        let ret = 0;
        while (Util.not(Util.lt(posY, 16))) {
            posY = Util.sub(posY, 16);
            ret = Util.add(ret, 32);
        }
        // ret should be (posY / 16) * 32

        while (Util.not(Util.lt(posX, 16))) {
            posX = Util.sub(posX, 16);
            ret = Util.add(ret, 1);
        }
        // ret should be (posY / 16) * 32 + (posX / 16)
        return ret;
    }
}
Main.main();