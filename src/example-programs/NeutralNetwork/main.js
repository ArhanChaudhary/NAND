import { Dot } from "./dot.js";

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const dot = new Dot();

dot.show(ctx);
dot.move();
dot.show(ctx);
dot.move();
dot.show(ctx);
