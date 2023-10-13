import Population from "./population.js";
import Vector from "./vector.js";

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const population = new Population(200);

export const goal = new Vector(256, 10);
drawRect(goal.getX() - 2, goal.getY() - 2, goal.getX() + 2, goal.getY() + 2, "black");

setInterval(() => {
    if (population.allDotsDead()) {
        population.calculateFitness();
        // population.naturalSelection();
        // population.mutateBabies();
    } else {
        population.update();
        population.show();
    }
}, 200);

export function drawRect(x1, y1, x2, y2, color) {
    ctx.beginPath();
    ctx.fillStyle = color;
    ctx.rect(x1, y1, x2 - x1, y2 - y1);
    ctx.fill();
}