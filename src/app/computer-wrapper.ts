import * as computer from "core";

let screen: Worker;
let stopRunner = false;
let emitInterval: NodeJS.Timeout | void;
let emitIntervalTotal = 0;
// adjust accordingly
// lowest value until the Hz starts to drop
// we want the lowest so the keyboard is faster
const fastestStep = 30_000;
const slowestStep = 1;
let step = fastestStep;

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
    computer.ticktock();
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
  // screen memory bitmap
  // TODO: this problem *may* be solved in the future with
  // https://rustwasm.github.io/wasm-bindgen/examples/wasm-in-web-worker.html
  // and https://github.com/rustwasm/wasm-bindgen/tree/main/examples/wasm-in-web-worker
  // but for now, this is the best I can do
  screen.postMessage(computer.getScreen());
  if (computer.keyboard(0, false) === 32767) {
    computer.keyboard(0, true);
    stop();
  }
}

const emitIntervalDelay = 50;
let prevEmit: number;
const prevSecTotalAvgTime = 1;
const prevSecTotals: number[] = [];
function emitInfo() {
  const currentEmit = performance.now();
  const secTotal = (emitIntervalTotal / (currentEmit - prevEmit)) * 1000;
  if (
    prevSecTotals.length ===
    (1000 * prevSecTotalAvgTime) / emitIntervalDelay
  ) {
    prevSecTotals.shift();
  }
  prevSecTotals.push(secTotal);
  // emitIntervalTotal / (currentEmit - prevEmit) = emitSecTotal / 1000
  prevEmit = currentEmit;
  emitIntervalTotal = 0;

  self.postMessage({
    action: "emitInfo",
    hz: prevSecTotals.reduce((a, b) => a + b) / prevSecTotals.length,
    NANDCalls: computer.NANDCalls(),
  });
}

async function initialize() {
  // https://github.com/Menci/vite-plugin-top-level-await?tab=readme-ov-file#workers
  if (import.meta.env.DEV) {
    screen = new Worker(new URL("screen.ts", import.meta.url), {
      type: "module",
    });
  } else {
    screen = new Worker(new URL("screen.ts", import.meta.url), {
      type: "classic",
    });
  }
  await new Promise<void>((resolve) => {
    screen.addEventListener("message", (e) => {
      if (e.data === "ready") {
        resolve();
      }
    });
  });

  self.addEventListener("message", (e) => {
    switch (e.data.action) {
      case "initialize":
        screen.postMessage(e.data.canvas, [e.data.canvas]);
        break;
      case "loadROM":
        computer.loadROM(e.data.machineCode);
        break;
      case "start":
        start();
        break;
      case "reset":
        reset();
        break;
      case "resetAndStart":
        resetAndStart(e);
        break;
      case "keyboard":
        computer.keyboard(e.data.key, true);
        break;
      case "stop":
        stop();
        break;
      case "speed":
        speed(e);
        break;
    }
  });

  self.postMessage({ action: "ready" });
}

function start() {
  if (emitInterval) return;
  stopRunner = false;
  // runner first because worker startup is slow and the very first emit
  // will be like half as fast as the following ones. So, we can call runner
  // first and then define the interval and prevEmit to sort of nudge it
  // closer to the actual value.
  runner();
  prevEmit = performance.now();
  emitInterval = setInterval(emitInfo, emitIntervalDelay);
}

function reset() {
  if (!prevEmit) return;
  stopRunner = true;
  computer.reset();
  emitInterval = clearInterval(emitInterval as NodeJS.Timeout);
  emitIntervalTotal = 0;
  prevSecTotals.length = 0;
  self.postMessage({
    action: "emitInfo",
    hz: 0,
    NANDCalls: 0n,
  });
}

function resetAndStart(e: MessageEvent<any>) {
  if (prevEmit) {
    computer.reset();
    emitIntervalTotal = 0;
    prevSecTotals.length = 0;
    self.postMessage({
      action: "emitInfo",
      hz: 0,
      NANDCalls: 0n,
    });
  }
  computer.loadROM(e.data.machineCode);
  start();
}

function stop() {
  stopRunner = true;
  if (emitInterval) emitInfo();
  emitInterval = clearInterval(emitInterval as NodeJS.Timeout);
  self.postMessage({
    action: "stopRunner",
  });
}

function speed(e: MessageEvent<any>) {
  const minLogValue = Math.log10(slowestStep);
  const maxLogValue = Math.log10(fastestStep);
  const logScaledValue =
    minLogValue + (e.data.speed / 100) * (maxLogValue - minLogValue);
  const linearScaledValue = Math.pow(10, logScaledValue);
  step = linearScaledValue;
}

initialize();
