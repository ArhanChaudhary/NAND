<script lang="ts" context="module">
  import { runner } from './runner-store'

  const OS: Array<{fileName: string, file: string[]}> = [];
  async function readFile(input: URL): Promise<string> {
    const response = await fetch(input);
    return await response.text();
  }
  async function loadOS() {
    const OSFiles: string[] = [
      'Array',
      'Keyboard',
      'Math',
      'Memory',
      'Output',
      'Screen',
      'String',
      'Sys'
    ];

    for (const OSFile of OSFiles) {
      const content = await readFile(new URL(`../os/${OSFile}.vm`, import.meta.url));
      OS.push({
        fileName: OSFile,
        file: content.split('\n')
      });
    }
  }
  await loadOS();
  let runner_: Worker;
</script>

<script lang="ts">
  import assembler from '../assembler/main';
  import VMTranslator from '../vm/main';
  import compiler from '../compiler/main';
  import { onMount } from "svelte";

  let mHz = '0';
  let NANDCalls = 0;
  onMount(async () => {
    if (!runner_) {
      await new Promise<void>(resolve => {
        runner.subscribe(runner => {
          if (runner) {
            runner_ = runner;
            resolve();
          }
        });
      });
    }
    const offscreen = document.querySelector('canvas').transferControlToOffscreen();
    runner_.postMessage({action: 'initialize', canvas: offscreen}, [offscreen]);

    const jackCode: Array<{fileName: string, file: string[]}> = [];
    let name: string;
    while ((name = prompt("File name")) !== 'stop') {
      jackCode.push({
        fileName: name,
        file: prompt("File contents").split('\n'),
      });
    }
    const VMCode = compiler(jackCode);
    VMCode.push(...OS);
    const assembly = VMTranslator(VMCode);
    const machineCode = assembler(assembly);
    runner_.postMessage({action: 'loadROM', machineCode});
    runner_.postMessage({action: 'start'});

    runner_.addEventListener('message', e => {
      switch (e.data.action) {
        case 'emitInfo':
          mHz = (e.data.hz / 1_000_000).toFixed(2);
          NANDCalls = Number(e.data.NANDCalls * 100n / 1_000_000_000_000n) / 100
          break;
      }
    });

    let prev: number;
    document.addEventListener("keydown", (e) => {
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
      if (keyValue === undefined) keyValue = e.key.charCodeAt(0);
      if (keyValue !== prev && prev !== 0) {
        keyValue = 0;
      }
      prev = keyValue;
      runner_.postMessage({action: 'keyboard', key: keyValue});
    });

    document.addEventListener("keyup", (e) => {
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
  <div id="secHz">Computer clock mHz: {mHz}</div>
  <div id="NANDCalls">NAND Calls: {NANDCalls} trillion</div>
</div>