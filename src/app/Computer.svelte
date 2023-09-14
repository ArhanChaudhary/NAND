<script lang="ts" context="module">
  import { runner } from './runner-store'

  export const VMOS: Array<{fileName: string, file: string[]}> = [];
  export const JackOS: Array<{fileName: string, file: string[]}> = [];

  for (const [OSFilePath, OSFile] of Object.entries(
    import.meta.glob('../os/*.{vm,jack}', { as: 'raw' })
  )) {
    if (OSFilePath.endsWith('.vm')) {
      VMOS.push({
        fileName: OSFilePath.replace('../os/', '').replace('.vm', ''),
        file: (await OSFile() as string).split('\n'),
      });
    } else {
      JackOS.push({
        fileName: OSFilePath.replace('../os/', '').replace('.jack', ''),
        file: (await OSFile() as string).split('\n'),
      });
    }
  }

  let runner_: Worker;
  await (async () => {
    new Promise<void>(resolve => {
      runner.subscribe(runner => {
        if (runner) {
          runner_ = runner;
          resolve();
        }
      });
    });
  })();
</script>

<script lang="ts">
  import { onMount } from "svelte";

  let mHz = '0';
  let NANDCalls = '0';
  onMount(() => {
    const offscreen = document.querySelector('canvas').transferControlToOffscreen();
    runner_.postMessage({action: 'initialize', canvas: offscreen}, [offscreen]);
    runner_.addEventListener('message', e => {
      switch (e.data.action) {
        case 'emitInfo':
          if (e.data.hz >= 100_000) {
            mHz = Number(e.data.hz / 1_000_000).toPrecision(3) + ' MHz';
          } else if (e.data.hz >= 1_000) {
            mHz = Number(e.data.hz / 1_000).toPrecision(3) + ' KHz';
          } else {
            mHz = Number(e.data.hz).toPrecision(3) + ' Hz';
          }

          if (e.data.NANDCalls >= 1_000_000_000_000n) {
            NANDCalls = Number(e.data.NANDCalls * 1000n / 1_000_000_000_000n) / 1000 + ' trillion';
          } else if (e.data.NANDCalls >= 1_000_000_000n) {
            NANDCalls = Number(e.data.NANDCalls * 10n / 1_000_000_000n) / 10 + ' billion';
          } else if (e.data.NANDCalls >= 1_000_000n) {
            NANDCalls = Number(e.data.NANDCalls / 1_000_000n) + ' million';
          } else {
            NANDCalls = '0';
          }
          break;
      }
    });

    let prev: number;
    document.addEventListener("keydown", e => {
      let keyValue: number | undefined = {
        Enter: 128,
        Backspace: 129,
        ArrowLeft: 130,
        ArrowUp: 131,
        ArrowRight: 132,
        ArrowDown: 133,
        Delete: 139,
        Escape: 140,
        F1: 141,
        F2: 142,
        F3: 143,
        F4: 144,
        F5: 145,
        F6: 146,
        F7: 147,
        F8: 148,
        F9: 149,
        F10: 150,
        F11: 151,
        F12: 152,
      }[e.key];
      if (keyValue === undefined) {
        if (e.key.length !== 1) return;
        keyValue = e.key.charCodeAt(0);
      }
      if (keyValue !== prev && prev !== 0) {
        keyValue = 0;
      }
      prev = keyValue;
      runner_.postMessage({action: 'keyboard', key: keyValue});
    });

    document.addEventListener("keyup", () => {
      prev = 0;
      runner_.postMessage({action: 'keyboard', key: 0});
    });
  });
</script>

<style lang="scss">
  canvas {
    image-rendering: pixelated;
    image-rendering: crisp-edges;
    border: 2px solid black;
    background: white;
    aspect-ratio: 2 / 1;
    height: 500px;
  }
  #secHz {
    font-size: 30px;
  }
  #NANDCalls {
    font-size: 22px;
  }
</style>

<div id="computer-wrapper">
  <canvas width="512" height="256" />
  <div id="secHz">Clock speed: {mHz}</div>
  <div id="NANDCalls">NAND Calls: {NANDCalls}</div>
</div>