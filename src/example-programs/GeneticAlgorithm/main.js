import Population from "./population.js";
import AccelerationVectorPair from "./accelerationvectorpair.js";
import Dot from "./dot.js";
import Util from "./util.js";
import Brain from "./brain.js";

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
  static #resetMinStep;
  static #precomputeFitnesses;

  static #generationString;
  static #goalStepCountString;
  static #goalDistanceString;
  static #NAString;
  static #obstaclesString;
  static #escapeString;
  static #dotString;
  static #goalString;
  static #precomputingString;
  static #optionOne;
  static #optionTwo;
  static #optionThree;
  static #optionFour;
  static #optionFourToggled;
  static #optionFive;
  static #optionSelect;

  static init() {
    let i = 0;
    Util.setColor(0);
    Main.#initialX = 256;
    Main.#initialY = 127;
    Main.#goalX = 0;
    Main.#generationString = "Generation: ";
    Main.#goalStepCountString = "Goal step count: ";
    Main.#goalDistanceString = "Goal distance: ";
    Main.#NAString = "NA";
    Main.#dotString = "Set the initial dot position with the arrow keys.";
    Main.#goalString = "Set the goal position with the arrow keys.";
    Main.#obstaclesString =
      "Place obstacles with the arrow, enter, and delete keys.";
    Main.#escapeString = "Press escape to finish.";
    Main.#precomputingString = "Precomputing fitnesses...";
    Main.#optionOne = "1) Set initial dot position";
    Main.#optionTwo = "2) Set goal position";
    Main.#optionThree = "3) Set obstacles";
    Main.#optionFour = "4) Show all dots";
    Main.#optionFourToggled = "4) Show only best dot";
    Main.#optionFive = "5) Continue";
    Main.#optionSelect = "Select an option: ";
    Main.#floodQueue = new Array(100);
    Main.#obstacles = new Array(512);
    while (lt(i, 512)) {
      Main.#obstacles[i] = 0;
      i = add(i, 1);
    }
  }

  static async main() {
    let brainSize;
    let firstPairComponent = 0;

    // Util.drawRectangle(81, 67, 433, 144);
    Util.drawRectangle(71, 57, 443, 154);
    Util.setColor(0);
    // Util.drawRectangle(83, 69, 431, 142);
    Util.drawRectangle(73, 59, 441, 152);
    console.log("Welcome to my genetic algorithm simulation!");
    console.log("The objective is for dots to reach a goal in");
    console.log("as little steps as possible.");
    Util.init();
    AccelerationVectorPair.init();
    Population.init();
    Main.init();
    console.log("Press any key to start.");
    await new Promise((resolve) => {
      function tmp() {
        if (eq(Util.keyPressed(), 0)) {
          random();
          setTimeout(tmp, 0);
        } else {
          resolve();
        }
      }
      tmp();
    });
    Util.drawRectangle(71, 57, 443, 154);
    Util.setColor(neg(1));

    Main.#onlyBest = 0;
    await Main.setInitialDotOrGoalPosition(neg(1));
    Main.#goalX = 257;
    Main.#goalY = 127;
    await Main.setInitialDotOrGoalPosition(0);
    await Main.setObstacles();
    Util.clearScreen();
    Main.precomputeFitnesses();
    // maximum amount of steps to move across a 16x16 grid square
    brainSize = max(Main.#initialGoalDist, 5);
    Brain.config(brainSize);
    Dot.config(brainSize, Main.#obstacles);
    Population.config(brainSize, Main.#onlyBest, Main.#initialBestDotFitness);
    Main.refreshDisplay();
    window.interval = 25;
    async function tmp() {
      if (Population.allDotsDead()) {
        Population.naturalSelection();
        Main.#precomputeFitnesses = 0;
        Main.#resetMinStep = 0;
        if (eq(Util.keyPressed(), 140)) {
          await Main.showMenu();
        } else {
          Util.clearScreen();
        }
        if (Main.#precomputeFitnesses) {
          Main.precomputeFitnesses();
        }
        Main.refreshDisplay();
        if (Main.#resetMinStep) {
          Dot.resetMinStep();
        }
        firstPairComponent = 0;
      } else {
        firstPairComponent = not(firstPairComponent);
        Population.update(firstPairComponent);
      }
      setTimeout(tmp, window.interval);
    }
    tmp();
  }

  static setInitialDot() {
    Main.#initialX = 10;
    Main.#initialY = 128;
    Dot.setInitialPosition(Main.#initialX, Main.#initialY);
  }

  static setGoal() {
    Main.#goalX = 500;
    Main.#goalY = 128;
    Dot.setGoalPosition(Main.#goalX, Main.#goalY);
  }

  static async setInitialDotOrGoalPosition(setInitialDot) {
    let key;
    let prevPositionX = 0;
    let prevPositionY = 0;
    let positionX;
    let positionY;
    let boundX;
    let boundY;

    let sideLength;
    let halfSideLength;

    if (setInitialDot) {
      sideLength = 3;
      halfSideLength = 1;
      positionX = Main.#initialX;
      positionY = Main.#initialY;
      boundX = 508;
      boundY = 253;
    } else {
      sideLength = 5;
      halfSideLength = 2;
      positionX = Main.#goalX;
      positionY = Main.#goalY;
      boundX = 507;
      boundY = 252;
    }

    key = 1;
    while (not(eq(key, 140))) {
      await new Promise((resolve) => {
        function tmp() {
          if (eq(key, 0)) {
            key = Util.keyPressed();
            setTimeout(tmp, 0);
          } else {
            resolve();
          }
        }
        tmp();
      });
      // this if statement is here so it renders properly if an obstacle is on the initial position
      if (not(eq(prevPositionX, 0))) {
        Main.drawObstacle(
          Main.getGridIndex(
            sub(prevPositionX, halfSideLength),
            sub(prevPositionY, halfSideLength)
          )
        );
        Main.drawObstacle(
          Main.getGridIndex(
            sub(prevPositionX, halfSideLength),
            add(prevPositionY, halfSideLength)
          )
        );
        Main.drawObstacle(
          Main.getGridIndex(
            add(prevPositionX, halfSideLength),
            sub(prevPositionY, halfSideLength)
          )
        );
        Main.drawObstacle(
          Main.getGridIndex(
            add(prevPositionX, halfSideLength),
            add(prevPositionY, halfSideLength)
          )
        );
      }
      prevPositionX = positionX;
      prevPositionY = positionY;
      Util.setColor(0);
      Util.drawRectangle(
        sub(prevPositionX, halfSideLength),
        sub(prevPositionY, halfSideLength),
        add(prevPositionX, halfSideLength),
        add(prevPositionY, halfSideLength)
      );
      Util.setColor(neg(1));
      if (eq(key, 130)) {
        if (not(eq(positionX, halfSideLength))) {
          positionX = sub(positionX, sideLength);
        }
      } else if (eq(key, 131)) {
        if (not(eq(positionY, halfSideLength))) {
          positionY = sub(positionY, sideLength);
        }
      } else if (eq(key, 132)) {
        if (not(eq(positionX, boundX))) {
          positionX = add(positionX, sideLength);
        }
      } else if (eq(key, 133)) {
        if (not(eq(positionY, boundY))) {
          positionY = add(positionY, sideLength);
        }
      }
      Util.drawRectangle(
        sub(positionX, halfSideLength),
        sub(positionY, halfSideLength),
        add(positionX, halfSideLength),
        add(positionY, halfSideLength)
      );
      if (eq(key, 1)) {
        if (setInitialDot) {
          console.log(Main.#dotString);
        } else {
          console.log(Main.#goalString);
        }
        console.log(Main.#escapeString);
        // wait for key release
        await new Promise((resolve) => {
          function tmp() {
            if (not(eq(Util.keyPressed(), 0))) {
              setTimeout(tmp, 0);
            } else {
              resolve();
            }
          }
          tmp();
        });
        // wait for key press then hide
        await new Promise((resolve) => {
          function tmp() {
            if (eq(Util.keyPressed(), 0)) {
              setTimeout(tmp, 0);
            } else {
              resolve();
            }
          }
          tmp();
        });
        Util.setColor(0);
        Util.drawRectangle(17, 34, 489, 56);
        Util.setColor(neg(1));
        Main.drawObstacles();
      }
      if (not(eq(key, 140))) {
        key = 0;
        if (setInitialDot) {
          if (not(eq(Main.#goalX, 0))) {
            Main.drawGoal();
          }
        } else {
          Util.drawRectangle(
            sub(Main.#initialX, 1),
            sub(Main.#initialY, 1),
            add(Main.#initialX, 1),
            add(Main.#initialY, 1)
          );
        }
        await new Promise((resolve) => setTimeout(resolve, 10));
      }
    }
    if (setInitialDot) {
      Main.#initialX = positionX;
      Main.#initialY = positionY;
      Dot.setInitialPosition(Main.#initialX, Main.#initialY);
      if (not(eq(Main.#goalX, 0))) {
        Population.instantiateDots();
      }
    } else {
      Main.#goalX = positionX;
      Main.#goalY = positionY;
      Dot.setGoalPosition(Main.#goalX, Main.#goalY);
    }
  }

  static async setObstacles() {
    let selectorX = 0;
    let selectorY = 0;
    let selectorIndex = 0;
    let key = 0;
    let drag = 0;
    let draggingEnter = 0;

    console.log(Main.#obstaclesString);
    console.log(Main.#escapeString);
    selectorX = 256;
    selectorY = 112;
    selectorIndex = 240;
    key = 1;
    while (not(eq(key, 140))) {
      await new Promise((resolve) => {
        function tmp() {
          if (eq(key, 0)) {
            key = Util.keyPressed();
            setTimeout(tmp, 0);
          } else {
            resolve();
          }
        }
        tmp();
      });
      Util.setColor(eq(Main.#obstacles[selectorIndex], neg(1)));
      Util.drawRectangle(
        selectorX,
        selectorY,
        add(selectorX, 15),
        add(selectorY, 15)
      );
      Util.setColor(neg(1));
      if (not(eq(key, 140))) {
        Main.drawGoal();
        Util.drawRectangle(
          sub(Main.#initialX, 1),
          sub(Main.#initialY, 1),
          add(Main.#initialX, 1),
          add(Main.#initialY, 1)
        );
        if (eq(key, 130)) {
          if (not(eq(selectorX, 0))) {
            selectorX = sub(selectorX, 16);
            selectorIndex = sub(selectorIndex, 1);
          }
        } else if (eq(key, 131)) {
          if (not(eq(selectorY, 0))) {
            selectorY = sub(selectorY, 16);
            selectorIndex = sub(selectorIndex, 32);
          }
        } else if (eq(key, 132)) {
          if (not(eq(selectorX, 496))) {
            selectorX = add(selectorX, 16);
            selectorIndex = add(selectorIndex, 1);
          }
        } else if (eq(key, 133)) {
          if (not(eq(selectorY, 240))) {
            selectorY = add(selectorY, 16);
            selectorIndex = add(selectorIndex, 32);
          }
        }
        Util.drawRectangle(
          selectorX,
          selectorY,
          add(selectorX, 15),
          add(selectorY, 15)
        );
        Util.setColor(0);
        Util.drawRectangle(
          add(selectorX, 1),
          add(selectorY, 1),
          add(selectorX, 14),
          add(selectorY, 14)
        );
        Util.setColor(neg(1));
        Util.drawRectangle(
          add(selectorX, 2),
          add(selectorY, 2),
          add(selectorX, 13),
          add(selectorY, 13)
        );
        if (eq(key, 128) | eq(key, 129)) {
          drag = not(drag & eq(draggingEnter, eq(key, 128)));
          draggingEnter = eq(key, 128);
          await new Promise((resolve) => {
            function tmp() {
              if (not(eq(key, 0))) {
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
        if (eq(key, 1)) {
          // wait for key release
          await new Promise((resolve) => {
            function tmp() {
              if (not(eq(Util.keyPressed(), 0))) {
                setTimeout(tmp, 0);
              } else {
                resolve();
              }
            }
            tmp();
          });
          // wait for key press then hide
          await new Promise((resolve) => {
            function tmp() {
              if (eq(Util.keyPressed(), 0)) {
                setTimeout(tmp, 0);
              } else {
                resolve();
              }
            }
            tmp();
          });
          Util.setColor(0);
          Util.drawRectangle(40, 34, 480, 56);
          Util.setColor(neg(1));
          Main.drawObstacles();
          key = 2;
        } else {
          key = 0;
        }
        await new Promise((resolve) => setTimeout(resolve, 45));
      }
    }
  }

  static precomputeFitnesses() {
    let allowUp;
    let allowDown;
    let allowRight;
    let allowLeft;
    let i = 0;
    let i2 = 0;

    while (not(gt(i, 511))) {
      if (not(eq(Main.#obstacles[i], neg(1)))) {
        Main.#obstacles[i] = 0;
      }
      i = add(i, 1);
    }

    console.log(Main.#precomputingString);

    i = Main.getGridIndex(Main.#goalX, Main.#goalY);
    Main.#floodQueue[0] = i;
    Main.#floodQueueLength = 1;
    Main.#obstacles[i] = 1;
    while (gt(Main.#floodQueueLength, 0)) {
      i = Main.#floodQueue[0];
      i2 = 1;
      while (not(eq(i2, Main.#floodQueueLength))) {
        Main.#floodQueue[sub(i2, 1)] = Main.#floodQueue[i2];
        i2 = add(i2, 1);
      }

      Main.#floodQueueLength = sub(Main.#floodQueueLength, 1);
      Main.#floodDist = Main.#obstacles[i];
      allowUp = gt(i, 31);
      allowDown = lt(i, 480);
      allowRight = not(eq(i & 31, 31));
      allowLeft = not(eq(i & 31, 0));

      Main.#isAdjacent = neg(1);
      if (allowUp) {
        Main.floodIndex(i, 1, 32);
      }

      if (allowRight) {
        Main.floodIndex(i, 32, neg(1));
      }

      if (allowDown) {
        Main.floodIndex(i, neg(1), neg(32));
      }

      if (allowLeft) {
        Main.floodIndex(i, neg(32), 1);
      }

      Main.#isAdjacent = 0;
      if (allowUp) {
        if (allowRight) {
          Main.floodIndex(sub(i, 31), neg(1), 32);
        }

        if (allowLeft) {
          Main.floodIndex(sub(i, 33), 32, 1);
        }
      }

      if (allowDown) {
        if (allowRight) {
          Main.floodIndex(add(i, 33), neg(32), neg(1));
        }

        if (allowLeft) {
          Main.floodIndex(add(i, 31), 1, neg(32));
        }
      }
    }

    i2 = Main.getGridIndex(Main.#initialX, Main.#initialY);
    Main.#initialGoalDist = Main.#obstacles[i2];
    i = 0;
    while (lt(i, 512)) {
      if (not(eq(Main.#obstacles[i], neg(1)) | eq(Main.#obstacles[i], 0))) {
        Main.#obstacles[i] = min(3276, div(32767, Main.#obstacles[i]));
        if (eq(i, i2)) {
          Main.#initialBestDotFitness = Main.#obstacles[i2];
        }
      } else if (eq(i, i2)) {
        Main.#initialGoalDist = 200;
        Main.#initialBestDotFitness = 1;
      }
      i = add(i, 1);
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
      bottomLeft = sub(i, leftIndex);
      bottomRight = add(i, leftIndex);
      topLeft = sub(bottomLeft, rightIndex);
      topRight = sub(bottomRight, rightIndex);

      // || so it short circuits
      penalty = min(
        add(
          Main.floodIndexOutOfBounds(i, bottomLeft) ||
            eq(Main.#obstacles[bottomLeft], neg(1)),
          Main.floodIndexOutOfBounds(i, bottomRight) ||
            eq(Main.#obstacles[bottomRight], neg(1))
        ),
        add(
          Main.floodIndexOutOfBounds(i, topLeft) ||
            eq(Main.#obstacles[topLeft], neg(1)),
          Main.floodIndexOutOfBounds(i, topRight) ||
            eq(Main.#obstacles[topRight], neg(1))
        )
      );
      i = sub(i, rightIndex);
    } else {
      rightIndex =
        Main.floodIndexOutOfBounds(i, add(i, rightIndex)) |
        eq(Main.#obstacles[add(i, rightIndex)], neg(1));
      leftIndex =
        Main.floodIndexOutOfBounds(i, add(i, leftIndex)) |
        eq(Main.#obstacles[add(i, leftIndex)], neg(1));
      penalty = add(leftIndex, rightIndex);
    }

    if (eq(penalty, neg(2))) {
      if (Main.#isAdjacent) {
        floodVal = add(Main.#floodDist, 11);
      } else {
        floodVal = add(Main.#floodDist, 65);
      }
    } else if (eq(penalty, neg(1))) {
      if (Main.#isAdjacent) {
        floodVal = add(Main.#floodDist, 8);
      } else {
        // cant be ran because this will override the add(, 11) case
        // it also isnt natural for dots to get past such an obstacle in a single diagonal step
        return;
      }
    } else {
      if (Main.#isAdjacent) {
        floodVal = add(Main.#floodDist, 6);
      } else {
        floodVal = add(Main.#floodDist, 9);
      }
    }

    if (eq(Main.#obstacles[i], 0) | gt(Main.#obstacles[i], floodVal)) {
      Main.#obstacles[i] = floodVal;
      Main.#floodQueue[Main.#floodQueueLength] = i;
      Main.#floodQueueLength = add(Main.#floodQueueLength, 1);
    }
  }

  static floodIndexOutOfBounds(originIndex, newIndex) {
    return (
      lt(newIndex, 0) |
      gt(newIndex, 511) |
      (eq(originIndex & 31, 31) & eq(newIndex & 31, 0)) |
      (eq(originIndex & 31, 0) & eq(newIndex & 31, 31))
    );
  }

  static drawGoal() {
    Util.drawRectangle(
      sub(Main.#goalX, 2),
      sub(Main.#goalY, 2),
      add(Main.#goalX, 2),
      add(Main.#goalY, 2)
    );
  }

  static drawObstacles() {
    let i = 0;
    while (lt(i, 512)) {
      Main.drawObstacle(i);
      i = add(i, 1);
    }
  }

  static drawObstacle(i) {
    let obstacleX;
    let obstacleY;

    obstacleY = 0;
    obstacleX = i;
    while (not(lt(obstacleX, 32))) {
      obstacleX = sub(obstacleX, 32);
      obstacleY = add(obstacleY, 16);
    }
    obstacleX = sub(i, add(obstacleY, obstacleY));
    obstacleX = add(obstacleX, obstacleX);
    obstacleX = add(obstacleX, obstacleX);
    obstacleX = add(obstacleX, obstacleX);
    obstacleX = add(obstacleX, obstacleX);
    if (eq(Main.#obstacles[i], neg(1))) {
      Util.drawRectangle(
        obstacleX,
        obstacleY,
        add(obstacleX, 15),
        add(obstacleY, 15)
      );
    } else if (not(eq(Main.#obstacles[i], 0))) {
      Util.drawText(
        div(32767, Main.#obstacles[i]),
        add(obstacleX, 8),
        add(obstacleY, 8)
      );
    }
  }

  static refreshDisplay() {
    let tmp;
    let bestDotFitness;
    let minStep = Dot.getMinStep();
    Main.drawGoal();
    Main.drawObstacles();
    console.log(Main.#generationString + Population.getGen());
    if (eq(minStep, 32767)) {
      bestDotFitness = Population.getBestDotFitness();
      if (eq(bestDotFitness, 1)) {
        tmp = Main.#NAString;
      } else {
        tmp = div(32767, bestDotFitness);
      }
      console.log(Main.#goalDistanceString + tmp);
    } else {
      console.log(Main.#goalStepCountString + minStep);
    }
  }

  static getGridIndex(posX, posY) {
    let ret = 0;
    while (not(lt(posY, 16))) {
      posY = sub(posY, 16);
      ret = add(ret, 32);
    }
    // ret should be (posY / 16) * 32

    while (not(lt(posX, 16))) {
      posX = sub(posX, 16);
      ret = add(ret, 1);
    }
    // ret should be (posY / 16) * 32 + (posX / 16)
    return ret;
  }

  static async showMenu() {
    let selected;
    let toAlert = "";
    Util.clearScreen();
    toAlert += Main.#optionOne;
    toAlert += "\n";
    toAlert += Main.#optionTwo;
    toAlert += "\n";
    toAlert += Main.#optionThree;
    toAlert += "\n";
    if (Main.#onlyBest) {
      toAlert += Main.#optionFour;
    } else {
      toAlert += Main.#optionFourToggled;
    }
    toAlert += "\n";
    toAlert += Main.#optionFive;
    toAlert += "\n";
    toAlert += "\n";
    await new Promise((resolve) => {
      function tmp() {
        if (not(eq(Util.keyPressed(), 0))) {
          setTimeout(tmp, 0);
        } else {
          resolve();
        }
      }
      tmp();
    });
    toAlert += Main.#optionSelect;
    selected = +prompt(toAlert) || 0;
    // for GUIs and exit (so precomputeFitness/refreshDisplay runs with an already cleared screen)
    if (eq(selected, 1) | eq(selected, 2) | eq(selected, 3) | eq(selected, 5)) {
      Util.setColor(0);
      Util.drawRectangle(143, 68, 379, 165);
      Util.setColor(neg(1));
    }
    if (eq(selected, 1)) {
      await Main.setInitialDotOrGoalPosition(neg(1));
      Main.#resetMinStep = neg(1);
    } else if (eq(selected, 2)) {
      await Main.setInitialDotOrGoalPosition(0);
      Main.#precomputeFitnesses = neg(1);
      Main.#resetMinStep = neg(1);
    } else if (eq(selected, 3)) {
      await Main.setObstacles();
      Main.#precomputeFitnesses = neg(1);
      Main.#resetMinStep = neg(1);
    } else if (eq(selected, 4)) {
      Main.#onlyBest = not(Main.#onlyBest);
      Population.toggleOnlyBest();
    }
    if (not(eq(selected, 5))) {
      await Main.showMenu();
    }
  }
}
Main.main();
