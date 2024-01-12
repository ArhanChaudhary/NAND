import { render as computer_render } from "core";

let ctx: OffscreenCanvasRenderingContext2D;
self.addEventListener("message", (e) => {
  if (!ctx) {
    ctx = e.data.getContext("2d", { alpha: false, desynchronized: true });
    return;
  }
  computer_render(ctx, e.data);
});

self.postMessage("ready");
