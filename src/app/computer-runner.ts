import computer_init, {
  NANDCalls as computer_NANDCalls,
  keyboard as computer_keyboard,
  loadROM as computer_loadROM,
  ticktockFor as computer_ticktockFor,
  reset as computer_reset,
} from "core";

self.postMessage({ action: "loaded" });

let emitInterval: NodeJS.Timeout | undefined;
let runnerInterval: NodeJS.Timeout | undefined;
let emitIntervalTotal = 0;
// adjust accordingly
// lowest value until the Hz starts to drop
// we want the lowest so the keyboard is faster
const fastestStep = 30_000;
const slowestStep = 1;
let step = fastestStep;

function runner() {
  // Testing here has shown that a busy loop is actually the exact same speed
  // as setInterval(runner, 0)! This was a bit surprising to me, and I suspect
  // this is due to v8 optimizations. Imagine how cool it would have been if
  // this entire web worker ran on a busy loop and state was shared through
  // SharedArrayBuffer. I can't really complain, though, as that probably
  // would have been hell to implement lol
  computer_ticktockFor(step);
  emitIntervalTotal += step;
  if (computer_keyboard(0, false) === 32767) {
    computer_keyboard(0, true);
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
  prevEmit = currentEmit;
  emitIntervalTotal = 0;
  self.postMessage({
    action: "emitInfo",
    hz: prevSecTotals.reduce((a, b) => a + b) / prevSecTotals.length,
    NANDCalls: computer_NANDCalls(),
  });
}

self.onmessage = async (e) => {
  await computer_init(e.data.wasm_module, e.data.wasm_memory);

  self.onmessage = (e) => {
    switch (e.data.action) {
      case "loadROM":
        computer_loadROM(e.data.machineCode);
        break;
      case "start":
        start();
        break;
      case "reset":
        reset();
        break;
      case "resetAndStart":
        resetAndStart(e.data.machineCode);
        break;
      case "keyboard":
        computer_keyboard(e.data.key, true);
        break;
      case "stop":
        stop();
        break;
      case "speed":
        speed(e.data.speedPercentage);
        break;
    }
  };

  self.postMessage({ action: "ready" });
};

function start() {
  if (emitInterval) return;
  // worker startup is slow and the very first emit will be significantly slower
  // than the following ones. So, we want to sort of nudge the first emit closer
  // closer to a higher value. A higher value happens if prevEmit and
  // currentEmit are closer together, so we first create the interval to make
  // the comparsion happen sooner and then we defined prevEmit as late as
  // possible, after runner()
  emitInterval = setInterval(emitInfo, emitIntervalDelay);
  runnerInterval = setInterval(runner, 0);
  runner();
  prevEmit = performance.now();
}

function reset() {
  if (!prevEmit) return;
  if (emitInterval) {
    runnerInterval = clearInterval(runnerInterval as NodeJS.Timeout) as undefined;
    emitInterval = clearInterval(emitInterval as NodeJS.Timeout) as undefined;
    emitIntervalTotal = 0;
  }
  computer_reset();
  prevSecTotals.length = 0;
  self.postMessage({
    action: "emitInfo",
    hz: 0,
    NANDCalls: 0n,
  });
}

function resetAndStart(machineCode: string[]) {
  if (prevEmit) {
    computer_reset();
    emitIntervalTotal = 0;
    prevSecTotals.length = 0;
    self.postMessage({
      action: "emitInfo",
      hz: 0,
      NANDCalls: 0n,
    });
  }
  computer_loadROM(machineCode);
  start();
}

function stop() {
  if (!emitInterval) return;
  runnerInterval = clearInterval(runnerInterval as NodeJS.Timeout) as undefined;
  emitInfo();
  emitInterval = clearInterval(emitInterval as NodeJS.Timeout) as undefined;
  self.postMessage({
    action: "stopping",
  });
}

function speed(speedPercentage: number) {
  const minLogValue = Math.log10(slowestStep);
  const maxLogValue = Math.log10(fastestStep);
  const logScaledValue =
    minLogValue + (speedPercentage / 100) * (maxLogValue - minLogValue);
  const linearScaledValue = Math.pow(10, logScaledValue);
  step = linearScaledValue;
}
