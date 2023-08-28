// @ts-ignore
import * as computer from "core";

async function initialize() {
  let ctx: OffscreenCanvasRenderingContext2D;
  let running = false;
  self.addEventListener('message', function(e) {
    if (!ctx) {
      ctx = e.data.getContext('2d');
      ctx.fillStyle = 'black';
      return;
    }
    if (running) return;
    running = true;
    computer.render(ctx as unknown as CanvasRenderingContext2D, e.data);
    // we need a settimeout and can't just put running = false alone here
    // because the computer.render call is synchronous; that is even if there
    // is another message it will first wait for the render to finish and then
    // instantly do the render in the other message making the running = false
    // completely pointless. Add a small buffer to make sure the next message
    // is processed early enough
    setTimeout(() => {running = false}, 0);
  });

  self.postMessage('ready');
}

initialize();