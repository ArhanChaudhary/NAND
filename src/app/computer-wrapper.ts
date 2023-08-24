// @ts-ignore
import * as computer from "core";

let screen: Worker;
let reset = false;
let secTotal = 0;
let step = 100_000;
let slowedStep = 100_000;
// adjust accordingly
const OSEnd = 8_200_000;
function runner() {
  if (reset) {
    computer.ticktock(true);
    computer.clearScreen();
    screen.postMessage(computer.getScreen());
    reset = false;
    return;
  }
  // NOTE: there is no worry of runner being called while the previous call is
  // running because this is a web worker, so it's single threaded and will wait
  // for this to complete before calling it again
  setTimeout(runner, 0);
  if (secTotal >= OSEnd) {
    step = slowedStep;
  }
  for (let i = 0; i < step; i++) {
    computer.ticktock(false);
  }
  secTotal += step;
  // NOTE: although rustwasm is able to access SCREEN_MEMORY directly,
  // we still have to pass it as a parameter and use that because of
  // some complications with web workers and objects. According to
  // https://stackoverflow.com/questions/69487177/how-to-call-a-external-function-inside-a-web-worker
  // it's actually impossible to transfer the *same* non-serializable
  // object between the main thread and workers. Notice how I said same;
  // you may think that I can just import the wasm in the other worker
  // but that's instead an entiretly new wasm instance with its own empty
  // screen memory bitmap this problem *may* be solved in the future with
  // https://rustwasm.github.io/wasm-bindgen/examples/wasm-in-web-worker.html
  // and https://github.com/rustwasm/wasm-bindgen/tree/main/examples/wasm-in-web-worker
  // but for now, this is the best I can do
  screen.postMessage(computer.getScreen());
}

function emitHz() {
  self.postMessage({ action: 'emitHz', hz: secTotal });
  secTotal = 0;
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

  let interval: NodeJS.Timeout;
  self.addEventListener('message', function(e) {
    switch (e.data.action) {
      case 'initialize':
        screen.postMessage(e.data.canvas, [e.data.canvas]);
        break;
      case 'loadROM':
        computer.loadROM(e.data.assembled);
        break;
      case 'start':
        interval = setInterval(emitHz, 1000);
        runner();
        break;
      case 'keyboard':
        computer.keyboard(true, e.data.key);
        break;
      case 'reset':
        clearInterval(interval);
        reset = true;
        break;
    }
  });

  self.postMessage({action: 'ready'});
}

initialize();