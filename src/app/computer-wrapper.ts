// @ts-ignore
import * as computer from "core";

let screen: Worker;
let stopRunner = false;
let emitIntervalTotal = 0;
// adjust accordingly
// lowest value until the Hz starts to drop
// we want the lowest so the keyboard is faster
const fastestStep = 30_000;
const slowestStep = 10;

let step = fastestStep;
// adjust accordingly
function runner() {
  if (stopRunner) {
    stopRunner = false;
    return;
  }
  // NOTE: there is no worry of runner being called while the previous call is
  // running because this is a web worker, so it's single threaded and will wait
  // for this to complete before calling it again
  setTimeout(runner, 0);
  for (let i = 0; i < step; i++) {
    computer.ticktock(false);
  }
  emitIntervalTotal += step;
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

const emitIntervalDelay = 50;
let prevEmit: number;
const prevSecTotalAvgTime = 1;
const prevSecTotals: number[] = []
function emitInfo() {
  const currentEmit = performance.now();
  const secTotal = emitIntervalTotal / (currentEmit - prevEmit) * 1000;
  if (prevSecTotals.length === 1000 * prevSecTotalAvgTime / emitIntervalDelay) {
    prevSecTotals.shift();
  }
  prevSecTotals.push(secTotal);
  // emitIntervalTotal / (currentEmit - prevEmit) = emitSecTotal / 1000
  prevEmit = currentEmit;
  emitIntervalTotal = 0;

  self.postMessage({
    action: 'emitInfo',
    hz: prevSecTotals.reduce((a, b) => a + b) / prevSecTotals.length,
    NANDCalls: computer.NANDCalls(),
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

  let emitInterval: NodeJS.Timeout | void;
  self.addEventListener('message', function(e) {
    switch (e.data.action) {
      case 'initialize':
        screen.postMessage(e.data.canvas, [e.data.canvas]);
        break;
      case 'loadROM':
        computer.loadROM(e.data.machineCode);
        break;
      case 'start':
        if (emitInterval) return;
        stopRunner = false;
        // runner first because worker startup is slow and the very first emit
        // will be like half as fast as the following ones. So, we can call runner
        // first and then define the interval and prevEmit to sort of nudge it
        // closer to the actual value.
        runner();
        prevEmit = performance.now();
        emitInterval = setInterval(emitInfo, emitIntervalDelay);
        break;
      case 'keyboard':
        computer.keyboard(true, e.data.key);
        break;
      case 'reset':
        if (!prevEmit) return;
        stopRunner = true;
        emitInterval = clearInterval(emitInterval as NodeJS.Timeout);
        computer.ticktock(true);
        emitIntervalTotal = 0;
        prevSecTotals.fill(0);
        computer.resetNANDCalls();
        emitInfo();
        break;
      case 'stop':
        stopRunner = true;
        emitInterval = clearInterval(emitInterval as NodeJS.Timeout);
        break;
      case 'speed':
        const minLogValue = Math.log10(slowestStep);
        const maxLogValue = Math.log10(fastestStep);
        const logScaledValue = minLogValue + (e.data.speed / 100) * (maxLogValue - minLogValue);
        const linearScaledValue = Math.pow(10, logScaledValue);
        step = linearScaledValue;
    }
  });

  self.postMessage({action: 'ready'});
}

initialize();