<script lang="ts">
  import * as computer from "core";
  import assembler from '../assembler/main';
  import VMTranslator from '../vm/main';
  import compiler from '../compiler/main';
  import { onMount } from "svelte";

  const OS: Array<{fileName: string, file: string[]}> = [];
  async function readFile(input: string): Promise<string> {
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
      const content = await readFile(`../os/${OSFile}.vm`);
      OS.push({
        fileName: OSFile,
        file: content.split('\n')
      });
    }
  }

  onMount(async () => {
    await loadOS();
    const jackInputStream: Array<{fileName: string, file: string[]}> = [];
    let name: string;
    while ((name = prompt("File name")) !== 'stop') {
      jackInputStream.push({
        fileName: name,
        file: prompt("File contents").split('\n'),
      });
    }
    const compiled = compiler(jackInputStream);
    compiled.push(...OS);
    const VMTranslated = VMTranslator(compiled);
    const assembled = assembler(VMTranslated);
    computer.loadROM(assembled);

    const offscreen = document.querySelector('canvas').transferControlToOffscreen();
    const screen = new Worker('app/screen.ts', { type: "module" });
    screen.postMessage(offscreen, [offscreen]);

    function runner() {
      for (let i = 0; i < 100_000; i++) {
        computer.ticktock(false);
      }
      screen.postMessage(computer.getScreen());
      setTimeout(runner, 0);
    }
    runner();

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
      computer.keyboard(true, keyValue);
    });

    document.addEventListener("keyup", (e) => {
      prev = 0;
      computer.keyboard(true, 0);
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
</style>

<canvas width="512" height="256" />