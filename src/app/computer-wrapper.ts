// @ts-ignore
import * as computer from "core";

let screen: Worker;
let reset = false;
function runner() {
  if (reset) {
    computer.ticktock(true);
    computer.clearScreen();
    screen.postMessage(computer.getScreen());
    reset = false;
    return;
  }
  for (let i = 0; i < 100_000; i++) {
    computer.ticktock(false);
  }
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