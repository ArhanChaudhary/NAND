import Population from "./population.js";
import Vector from "./vector.js";

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const population = new Population(500);

export const goal = new Vector(500, 128);
drawRect(goal.getX() - 2, goal.getY() - 2, goal.getX() + 2, goal.getY() + 2, "black");

function test() {
    let intervalTimer = 25;
    if (population.allDotsDead()) {
        population.calculateFitness();
        population.naturalSelection();
        population.mutateBabies();
    } else {
        population.update();
        population.show();
    }
    setTimeout(test, intervalTimer);
}
test();

export function drawRect(x1, y1, x2, y2, color) {
    ctx.beginPath();
    ctx.fillStyle = color;
    ctx.rect(x1, y1, x2 - x1, y2 - y1);
    ctx.fill();
}