// @ts-ignore
import * as computer from "core";

let screen: Worker;
let reset = false;
let total = 0;
let step = 100_000;
let slowed_step = 100_000;
function runner() {
  if (reset) {
    computer.ticktock(true);
    computer.clearScreen();
    screen.postMessage(computer.getScreen());
    reset = false;
    return;
  }
  // adjust accordingly
  if (total >= 8_200_000) {
    step = slowed_step;
  }
  for (let i = 0; i < step; i++) {
    computer.ticktock(false);
  }
  total += step;
  screen.postMessage(computer.getScreen());
  setTimeout(runner, 0);
}

async function initialize() {
  screen = new Worker('screen.ts', { type: 'module' });
  await new Promise<void>(resolve => {
    screen.addEventListener('message', e => {
      if (e.data === 'ready') {
        resolve();
      }
    });
  });

  self.addEventListener('message', function(e) {
    switch (e.data.action) {
      case 'initialize':
        screen.postMessage(e.data.canvas, [e.data.canvas]);
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