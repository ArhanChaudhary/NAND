import * as computer from "core";

let ctx: OffscreenCanvasRenderingContext2D;
self.addEventListener("message", (e) => {
  if (!ctx) {
    ctx = e.data.getContext("2d", { alpha: false, desynchronized: true });
    return;
  }
  computer.render(ctx, e.data);
});

self.postMessage("ready");
