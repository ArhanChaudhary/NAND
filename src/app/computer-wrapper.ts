// @ts-ignore
import * as computer from "core";

let screen: Worker;
let reset = false;
let total = 0;
let emitIntervalTotal = 0;
// adjust accordingly
// lowest value until the Hz starts to drop
// we want the lowest so the keyboard is faster
let step = 30_000;
let slowedStep = step;
// adjust accordingly
const OSEnd = 8_100_000;
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
  if (total > OSEnd) {
    step = slowedStep;
  }
  for (let i = 0; i < step; i++) {
    computer.ticktock(false);
  }
  emitIntervalTotal += step;
  total += step;
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

const emitInterval = 50;
let prevEmit = performance.now();
function emitInfo() {
  const currentEmit = performance.now();
  const emitSecTotal = emitIntervalTotal / (currentEmit - prevEmit) * 1000;
  // emitIntervalTotal / (currentEmit - prevEmit) = emitSecTotal / 1000
  self.postMessage({ action: 'emitHz', hz: emitSecTotal });
  prevEmit = currentEmit;
  emitIntervalTotal = 0;

  self.postMessage({
    action: 'emitNANDCalls',
    NANDCalls: Intl.NumberFormat('en-US', {
      notation: "compact",
      maximumFractionDigits: 1
    }).format(computer.NANDCalls())
  });
}

async function initialize() {
  screen = new Worker(new URL('screen.ts', import.meta.url), { type: 'module' });
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
        computer.loadROM(e.data.machineCode);
        break;
      case 'start':
        interval = setInterval(emitInfo, emitInterval);
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