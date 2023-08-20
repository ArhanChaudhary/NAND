<script lang="ts">
  import * as computer from "core";
  import { onMount } from 'svelte';

  onMount(() => {
    computer.load_rom(prompt().split('\n'))
    // const offscreen = document.querySelector('canvas').transferControlToOffscreen();
    // const screen = new Worker('screen.js');
    // screen.postMessage(offscreen, [offscreen]);

    let ctx = document.querySelector('canvas').getContext('2d');
    ctx.fillStyle = 'black';
    function runner() {
        for (let i = 0; i < 100000; i++) {
            computer.ticktock(false);
        }
        computer.render(ctx);
        // screen.postMessage(wasm.render);
        setTimeout(runner, 0);
    }
    runner();

    let prev: number;
    document.addEventListener('keydown', e => {
        let keyValue: number | undefined = {
            'Enter': 128,
            'Backspace': 129,
            'ArrowLeft': 130,
            'ArrowUp': 131,
            'ArrowRight': 132,
            'ArrowDown': 133,
            'Delete': 139,
            'Escape': 140,
            'F1': 141,
            'F2': 142,
            'F3': 143,
            'F4': 144,
            'F5': 145,
            'F6': 146,
            'F7': 147,
            'F8': 148,
            'F9': 149,
            'F10': 150,
            'F11': 151,
            'F12': 152,
        }[e.key];
        if (keyValue === undefined)
            keyValue = e.key.charCodeAt(0);
        if (keyValue !== prev && prev !== 0) {
            keyValue = 0;
        }
        prev = keyValue;
        computer.keyboard(true, keyValue);
    });

    document.addEventListener('keyup', e => {
        prev = 0;
        computer.keyboard(true, 0);
    });
  });
</script>

<style>
  main {
    background-color: tan;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  canvas {
    image-rendering: pixelated;
    image-rendering: crisp-edges;
    border: 2px solid black;
    background: white;
  }
</style>

<main>
  <canvas width="512" height="256"></canvas>
</main>
