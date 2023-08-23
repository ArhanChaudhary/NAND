// @ts-ignore
import * as computer from "core";

let ctx: OffscreenCanvasRenderingContext2D;
let reset = false;
function runner() {
  if (reset) {
    computer.ticktock(true);
    computer.clearScreen();
    computer.render(ctx, computer.getScreen());
    reset = false;
    return;
  }
  for (let i = 0; i < 100_000; i++) {
    computer.ticktock(false);
  }
  computer.render(ctx, computer.getScreen());
  setTimeout(runner, 0);
}

async function initialize() {
  self.addEventListener('message', function(e) {
    switch (e.data.action) {
      case 'initialize':
        ctx = e.data.canvas.getContext('2d');
        ctx.fillStyle = 'black';
        break;
      case 'loadROM':
        computer.loadROM(e.data.assembled);
        break;
      case 'start':
        runner();
        break;
      case 'keyboard':
        computer.keyboard(true, e.data.key);
        break;
      case 'reset':
        reset = true;
        break;
    }
  });

  self.postMessage('ready');
}

initialize();