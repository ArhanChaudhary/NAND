// @ts-ignore
import * as computer from "core";

async function initialize() {
  let ctx: OffscreenCanvasRenderingContext2D;
  self.addEventListener('message', function(e) {
    if (!ctx) {
      ctx = e.data.getContext('2d');
      ctx.fillStyle = 'black';
      return;
    }
    computer.render(ctx, e.data);
  });
}

initialize();