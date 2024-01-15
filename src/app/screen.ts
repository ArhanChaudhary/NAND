import computer_init, { render as computer_render } from "core";

let ctx: OffscreenCanvasRenderingContext2D;
self.addEventListener("message", (e) => {
  if (!ctx) {
    computer_init(undefined, e.data.memory);
    ctx = e.data.canvas.getContext("2d", {
      alpha: false,
      desynchronized: true,
    });
    return;
  }
  ctx.putImageData(computer_render(), 0, 0);
});

self.postMessage("ready");
