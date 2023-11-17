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
        Main.#generationString = "Generation: ";
        Main.#goalStepCountString = "Goal step count: ";
        Main.#goalDistanceString = "Goal distance: ";
        Main.#NAString = "NA";
        Main.#placeString = "Place obstacles with the arrow, enter, and delete keys.";
        Main.#escString = "Press esc to finish.";
        Main.#precomputingString = "Precomputing fitnesses...";
        Main.#floodQueue = new Array(100);
        Main.#obstacles = new Array(512);
    }

    static async main() {
        let brainSize;
        let firstPairComponent;
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
                if (Util.keyPressed() == 0) {
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
                if (Util.keyPressed() == 140) {
                    await Main.selectObstacles();
                }
                Main.refreshDisplay();
                firstPairComponent = false;
            } else {
                firstPairComponent = !firstPairComponent;
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
        while (!(i > 511)) {
            if (!(Main.#obstacles[i] == -1)) {
                Main.#obstacles[i] = 0;
            }
            i++;
        }
        console.log(Main.#placeString);
        console.log(Main.#escString);
        selectorX = 256;
        selectorY = 112;
        selectorIndex = 240;
        key = 1;
        while (!(key == 140)) {
            await new Promise(resolve => {
                function tmp() {
                    if (!(key > 0)) {
                        key = Util.keyPressed();
                        setTimeout(tmp, 0);
                    } else {
                        resolve();
                    }
                }
                tmp();
            });
            Util.setColor(Main.#obstacles[selectorIndex] == -1);
            Util.drawRectangle(selectorX, selectorY, selectorX + 15, selectorY + 15);
            Util.setColor(-1);
            if (!(key == 140)) {
                Main.drawGoal();
                Util.drawRectangle(Main.#initialX - 1, Main.#initialY - 1, Main.#initialX + 1, Main.#initialY + 1);
                if (key == 130) {
                    if (!(selectorX == 0)) {
                        selectorX = selectorX - 16;
                        selectorIndex = selectorIndex - 1;
                    }
                } else if (key == 131) {
                    if (!(selectorY == 0)) {
                        selectorY = selectorY - 16;
                        selectorIndex = selectorIndex - 32;
                    }
                } else if (key == 132) {
                    if (!(selectorX == 496)) {
                        selectorX = selectorX + 16;
                        selectorIndex = selectorIndex + 1;
                    }
                } else if (key == 133) {
                    if (!(selectorY == 240)) {
                        selectorY = selectorY + 16;
                        selectorIndex = selectorIndex + 32;
                    }
                }
                Util.drawRectangle(selectorX, selectorY, selectorX + 15, selectorY + 15);
                Util.setColor(0);
                Util.drawRectangle(selectorX + 1, selectorY + 1, selectorX + 14, selectorY + 14);
                Util.setColor(-1);
                Util.drawRectangle(selectorX + 2, selectorY + 2, selectorX + 13, selectorY + 13);
                if ((key == 128) || (key == 129)) {
                    drag = !(drag && (draggingEnter == ((key == 128) ? -1 : 0))) ? -1 : 0;
                    draggingEnter = key == 128 ? -1 : 0;
                    await new Promise(resolve => {
                        function tmp() {
                            if (key == 0) {
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
                if (key == 1) {
                    // wait for key release
                    await new Promise(resolve => {
                        function tmp() {
                            if (!(Util.keyPressed() == 0)) {
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
                            if (!(Util.keyPressed() > 0)) {
                                setTimeout(tmp, 0);
                            } else {
                                resolve();
                            }
                        }
                        tmp();
                    });
                    Util.setColor(0);
                    Util.drawRectangle(40, 34, 480, 56);
                    Util.setColor(-1);
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
        while (Main.#floodQueueLength > 0) {
            i = Main.#floodQueue[0];
            i2 = 1;
            while (!(i2 == Main.#floodQueueLength)) {
                Main.#floodQueue[i2 - 1] = Main.#floodQueue[i2];
                i2++;
            }

            Main.#floodQueueLength--;
            Main.#floodDist = Main.#obstacles[i];
            allowUp = i > 31;
            allowDown = i < 480;
            allowRight = !((i & 31) == 31);
            allowLeft = !((i & 31) == 0);

            Main.#isAdjacent = -1;
            if (allowUp) {
                Main.floodIndex(i, 1, 32);
            }

            if (allowRight) {
                Main.floodIndex(i, 32, -1);
            }

            if (allowDown) {
                Main.floodIndex(i, -1, -32);
            }

            if (allowLeft) {
                Main.floodIndex(i, -32, 1);
            }

            Main.#isAdjacent = 0;
            if (allowUp) {
                if (allowRight) {
                    Main.floodIndex(i - 31, -1, 32);
                }

                if (allowLeft) {
                    Main.floodIndex(i - 33, 32, 1);
                }
            }

            if (allowDown) {
                if (allowRight) {
                    Main.floodIndex(i + 33, -32, -1);
                }

                if (allowLeft) {
                    Main.floodIndex(i + 31, 1, -32);
                }
            }
        }

        i2 = Main.getGridIndex(Main.#initialX, Main.#initialY);
        Main.#initialGoalDist = Main.#obstacles[i2];
        i = 0;
        while (i < 512) {
            if (!(Main.#obstacles[i] == -1 || Main.#obstacles[i] == 0)) {
                Main.#obstacles[i] = Math.min(3276, Util.divide(32767, Main.#obstacles[i]));
                if (i == i2) {
                    Main.#initialBestDotFitness = Main.#obstacles[i2];
                }
            } else if (i == i2) {
                Main.#initialGoalDist = 200;
                Main.#initialBestDotFitness = 1;
            }
            i++;
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
            bottomLeft = i - leftIndex;
            bottomRight = i + leftIndex;
            topLeft = bottomLeft - rightIndex;
            topRight = bottomRight - rightIndex;

            penalty = Math.min(
                (Main.floodIndexOutOfBounds(i, bottomLeft) || Main.#obstacles[bottomLeft] == -1 ? -1 : 0) +
                (Main.floodIndexOutOfBounds(i, bottomRight) || Main.#obstacles[bottomRight] == -1 ? -1 : 0),
                (Main.floodIndexOutOfBounds(i, topLeft) || Main.#obstacles[topLeft] == -1 ? -1 : 0) +
                (Main.floodIndexOutOfBounds(i, topRight) || Main.#obstacles[topRight] == -1 ? -1 : 0)
            );
            i -= rightIndex;
        } else {
            rightIndex = Main.floodIndexOutOfBounds(i, i + rightIndex) || (Main.#obstacles[i + rightIndex] == -1) ? -1 : 0;
            leftIndex = Main.floodIndexOutOfBounds(i, i + leftIndex) || (Main.#obstacles[i + leftIndex] == -1) ? -1 : 0;
            penalty = leftIndex + rightIndex;
        }

        if (penalty == -2) {
            if (Main.#isAdjacent) {
                floodVal = Main.#floodDist + 12;
            } else {
                floodVal = Main.#floodDist + 65;
            }
        } else if (penalty == -1) {
            if (Main.#isAdjacent) {
                floodVal = Main.#floodDist + 9;
            } else {
                // cant be ran because this will override the + 13 case
                // it also isnt natural for dots to get past such an obstacle in a single diagonal step
                return;
            }
        } else {
            if (Main.#isAdjacent) {
                floodVal = Main.#floodDist + 5;
            } else {
                floodVal = Main.#floodDist + 7;
            }
        }

        if (Main.#obstacles[i] == 0 || Main.#obstacles[i] > floodVal) {
            Main.#obstacles[i] = floodVal;
            Main.#floodQueue[Main.#floodQueueLength] = i;
            Main.#floodQueueLength++;
        }
    }

    static floodIndexOutOfBounds(originIndex, newIndex) {
        return (newIndex < 0) || (newIndex > 511) ||
                (((originIndex & 31) == 31) && ((newIndex & 31) == 0)) ||
                (((originIndex & 31) == 0) && ((newIndex & 31) == 31));
    }

    static drawGoal() {
        Util.drawRectangle(Main.#goalX - 2, Main.#goalY - 2, Main.#goalX + 2, Main.#goalY + 2);
    }

    static drawObstacles() {
        let i = 0;
        let obstacleX;
        let obstacleY;

        while (i < 512) {
            obstacleY = 0;
            obstacleX = i;
            while (!(obstacleX < 32)) {
                obstacleX -= 32;
                obstacleY += 16;
            }
            obstacleX = i - (obstacleY + obstacleY);
            obstacleX = obstacleX + obstacleX;
            obstacleX = obstacleX + obstacleX;
            obstacleX = obstacleX + obstacleX;
            obstacleX = obstacleX + obstacleX;
            if (Main.#obstacles[i] == -1) {
                Util.drawRectangle(obstacleX, obstacleY, obstacleX + 15, obstacleY + 15);
            }/* else if (!(Main.#obstacles[i] == 0)) {
                Util.drawText(Util.divide(32767, Main.#obstacles[i]), obstacleX + 8, obstacleY + 8);
            }*/
            i++;
        }
    }

    static refreshDisplay() {
        let tmp;
        let bestDotFitness;
        let minStep = Dot.getMinStep();
        Main.drawGoal();
        Main.drawObstacles();
        console.log(Main.#generationString + Population.getGen());
        if (minStep == 32767) {
            bestDotFitness = Population.getBestDotFitness();
            if (bestDotFitness == -1 || bestDotFitness == 1) {
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
        while (!(posY < 16)) {
            posY -= 16;
            ret += 32;
        }
        // ret should be (posY / 16) * 32

        while (!(posX < 16)) {
            posX -= 16;
            ret++;
        }
        // ret should be (posY / 16) * 32 + (posX / 16)
        return ret;
    }
}
Main.main();