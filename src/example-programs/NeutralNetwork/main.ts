debugger;
import { Dot } from "./dot";

console.log(1);
const canvas = document.getElementById("canvas") as HTMLCanvasElement;
const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
ctx.fillStyle = "black";
new Dot().show(ctx);