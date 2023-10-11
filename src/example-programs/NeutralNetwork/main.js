import { Dot } from "./dot.js";

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const dot = new Dot();

setInterval(() => {
    dot.move();
    dot.show(ctx);
}, 100);