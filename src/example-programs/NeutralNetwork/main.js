import Population from "./population.js";

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const population = new Population(200);

setInterval(() => {
    population.update();
    population.show(ctx);
}, 10);