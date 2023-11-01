import Population from "./population.js";
import AccelerationVector from "./accelerationvector.js";
import Dot from "./dot.js";
import Util, { ctx } from "./util.js";
import Brain from "./brain.js";

export class Main {
    static #brainSize;
    static #populationCount;
    static #initialX;
    static #initialY;
    static #goalX;
    static #goalY;
    static #onlyBest;
    static #obstacles;

    static #generationString;
    static #goalStepCountString;
    static #NAString;
    static #placeString;
    static #loadingString;
    static #escString;

    static init() {
        let i = 0;
        Main.#generationString = "Generation: ";
        Main.#goalStepCountString = "Goal step count: ";
        Main.#NAString = "NA";
        Main.#placeString = "Place obstacles with the arrow, enter, and delete keys.";
        Main.#escString = "Press esc to finish.";
        Main.#loadingString = "Loading...";
        Main.#obstacles = new Array(512);
        while (!(i > 511)) {
            Main.#obstacles[i] = false;
            i++;
        }
    }

    static async main() {
        Util.init();
        AccelerationVector.init();
        Population.init();
        Main.init();

        Util.drawRect(70, 57, 442, 154);
        ctx.fillStyle = 'white';
        Util.drawRect(72, 59, 440, 152);
        console.log("Welcome to my genetic algorithm simulation!");
        console.log("The objective is for dots to reach a goal in");
        console.log("as little steps as possible.");
        console.log("Press any key to start.");
        await new Promise(resolve => {
            function tmp() {
                if (!(Util.keyPressed() > 0)) {
                    Util.random();
                    setTimeout(tmp, 0);
                } else {
                    resolve();
                }
            }
            tmp();
        });
        Util.drawRect(70, 57, 442, 154);

        Main.#initialX = 10;
        Main.#initialY = 128;
        Main.#goalX = 500;
        Main.#goalY = 128;
        Main.#onlyBest = false;
        await Main.selectObstacles();
        Util.clearScreen();
        console.log(Main.#loadingString);
        Main.#brainSize = 145;
        Main.#populationCount = 60;

        Brain.config(Main.#brainSize);
        Dot.config(Main.#initialX, Main.#initialY, Main.#goalX, Main.#goalY, Main.#brainSize, Main.#obstacles);
        Population.config(Main.#populationCount, Main.#brainSize, Main.#onlyBest);

        Main.refreshDisplay();
        window.interval = 25;
        async function tmp() {
            if (!Population.allDotsDead()) {
                Population.update();
            } else {
                Population.naturalSelection();
                if (Util.keyPressed() === 140) {
                    await Main.selectObstacles();
                }
                Main.refreshDisplay();
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
        console.log(Main.#placeString);
        console.log(Main.#escString);
        selectorX = 256;
        selectorY = 112;
        selectorIndex = 240;
        key = 1;
        while (!(key === 140)) {
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
            if (Main.#obstacles[selectorIndex]) {
                ctx.fillStyle = 'black';
            } else {
                ctx.fillStyle = 'white';
            }
            Util.drawRect(selectorX, selectorY, selectorX + 15, selectorY + 15);
            ctx.fillStyle = 'black';
            if (!(key === 140)) {
                Main.drawGoal();
                Util.drawRect(Main.#initialX - 1, Main.#initialY - 1, Main.#initialX + 1, Main.#initialY + 1);
                if (!(key === 130)) {
                    if (!(key === 131)) {
                        if (!(key === 132)) {
                            if (!((!(key === 133)) || (selectorY === 240))) {
                                selectorY = selectorY + 16;
                                selectorIndex = selectorIndex + 32;
                            }
                        } else if (!(selectorX === 496)) {
                            selectorX = selectorX + 16;
                            selectorIndex = selectorIndex + 1;
                        }
                    } else if (!(selectorY === 0)) {
                        selectorY = selectorY - 16;
                        selectorIndex = selectorIndex - 32;
                    }
                } else if (!(selectorX === 0)) {
                    selectorX = selectorX - 16;
                    selectorIndex = selectorIndex - 1;
                }
                Util.drawRect(selectorX, selectorY, selectorX + 15, selectorY + 15);
                ctx.fillStyle = 'white';
                Util.drawRect(selectorX + 1, selectorY + 1, selectorX + 14, selectorY + 14);
                ctx.fillStyle = 'black';
                Util.drawRect(selectorX + 2, selectorY + 2, selectorX + 13, selectorY + 13);
                if ((key === 128) || (key === 129)) {
                    drag = !(drag && (draggingEnter === (key === 128)));
                    draggingEnter = key === 128;
                    await new Promise(resolve => {
                        function tmp() {
                            if (!(key === 0)) {
                                key = Util.keyPressed();
                                setTimeout(tmp, 0);
                            } else {
                                resolve();
                            }
                        }
                        tmp();
                    });
                }
                if (drag) {
                    Main.#obstacles[selectorIndex] = draggingEnter;
                }
                if (!(key === 1)) {
                    key = 0;
                } else {
                    // wait for key release
                    await new Promise(resolve => {
                        function tmp() {
                            if (!(Util.keyPressed() === 0)) {
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
                    ctx.fillStyle = 'white';
                    Util.drawRect(40, 34, 480, 56);
                    ctx.fillStyle = 'black';
                    Main.drawObstacles();
                    key = 2;
                }
                await new Promise(resolve => setTimeout(resolve, 150));
            }
        }
    }

    static drawGoal() {
        Util.drawRect(Main.#goalX - 2, Main.#goalY - 2, Main.#goalX + 2, Main.#goalY + 2);
    }

    static drawObstacles() {
        let i;
        let obstacleX;
        let obstacleY;

        i = 0;
        while (!(i > 511)) {
            if (Main.#obstacles[i]) {
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
                Util.drawRect(obstacleX, obstacleY, obstacleX + 15, obstacleY + 15);
            }
            i++;
        }
    }

    static refreshDisplay() {
        Main.drawGoal();
        Main.drawObstacles();
        console.log(Main.#generationString + Population.getGen());
        if (!(Dot.getMinStep() === 32767)) {
            console.log(Main.#goalStepCountString + Dot.getMinStep());
        } else {
            console.log(Main.#goalStepCountString + Main.#NAString);
        }
    }
}
Main.main();