<script lang="ts" context="module">
  export const JackOS: Array<{ fileName: string; file: string[] }> = [];

  for (const [OSFilePath, OSFile] of Object.entries(
    import.meta.glob("../os/*.jack", { as: "raw" })
  )) {
    JackOS.push({
      fileName: OSFilePath.replace("../os/", "").replace(".jack", ""),
      file: ((await OSFile()) as string).split("\n"),
    });
  }
</script>

<script lang="ts">
  import { runner } from "./runner-store";

  let mHz = "0";
  let NANDCalls = "0";
  $: if ($runner) {
    const offscreen = document
      .querySelector("canvas")
      .transferControlToOffscreen();
    $runner.postMessage({ action: "initialize", canvas: offscreen }, [
      offscreen,
    ]);
    $runner.addEventListener(
      "message",
      (e: { data: { action: any; hz: number; NANDCalls: bigint } }) => {
        switch (e.data.action) {
          case "emitInfo":
            if (e.data.hz >= 100_000) {
              mHz = Number(e.data.hz / 1_000_000).toPrecision(3) + " MHz";
            } else if (e.data.hz >= 1_000) {
              mHz = Number(e.data.hz / 1_000).toPrecision(3) + " KHz";
            } else {
              mHz = Number(e.data.hz).toPrecision(3) + " Hz";
            }

            if (e.data.NANDCalls >= 1_000_000_000_000n) {
              NANDCalls =
                Number((e.data.NANDCalls * 1000n) / 1_000_000_000_000n) / 1000 +
                " trillion";
            } else if (e.data.NANDCalls >= 1_000_000_000n) {
              NANDCalls =
                Number((e.data.NANDCalls * 10n) / 1_000_000_000n) / 10 +
                " billion";
            } else if (e.data.NANDCalls >= 1_000_000n) {
              NANDCalls = Number(e.data.NANDCalls / 1_000_000n) + " million";
            } else {
              NANDCalls = "0";
            }
            break;
        }
      }
    );

    let prev: number;
    document.addEventListener("keydown", (e) => {
      let keyValue: number | undefined = {
        Enter: 128,
        Backspace: 129,
        ArrowLeft: 130,
        ArrowUp: 131,
        ArrowRight: 132,
        ArrowDown: 133,
        Home: 134,
        End: 135,
        PageUp: 136,
        PageDown: 137,
        Insert: 138,
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
      $runner.postMessage({ action: "keyboard", key: keyValue });
    });

    document.addEventListener("keyup", () => {
      prev = 0;
      $runner.postMessage({ action: "keyboard", key: 0 });
    });
  }
</script>

<div id="computer-wrapper">
  <div id="computer-frame">
    <div id="canvas-wrapper">
      <canvas width="512" height="256" />
      <!-- <div id="secHz">Clock speed: {mHz}</div>
      <div id="NANDCalls">NAND Calls: {NANDCalls}</div> -->
    </div>
  </div>
  <div id="computer-frame-bottom"></div>
  <div id="computer-neck"></div>
  <div id="computer-base"></div>
</div>

<style lang="scss">
  #computer-wrapper {
    --container-width: 100vw;
    --container-height: calc(100dvh - var(--nav-height));

    // MAKE SURE TO CHANGE 1.39 IF ANYTHING ELSE IS CHANGED

    --px: calc(
      min(var(--container-width), var(--container-height) * 1.39) / 810
    );
    --frame-padding: calc(var(--px) * 65);
    flex-flow: column;
    display: flex;
    align-items: center;
  }
  #computer-frame {
    background-color: hsl(41, 25%, 77%);
    padding: var(--frame-padding);
  }
  #canvas-wrapper {
    padding: 0px;
    background: hsl(0, 0%, 85%);
    border: calc(var(--px) * 15) solid;
    border-color: hsl(34, 11%, 57%) hsl(34, 15%, 68%) hsl(40, 42%, 87%);
  }
  canvas {
    image-rendering: pixelated;
    image-rendering: crisp-edges;
    background: hsl(0, 0%, 7%);
    display: block;
    aspect-ratio: 2 / 1;
    width: calc(var(--px) * 650);
  }
  #computer-frame-bottom {
    border-top: calc(var(--px) * 8) solid hsl(34, 8%, 50%);
    border-left: calc(var(--px) * 10) solid transparent;
    border-right: calc(var(--px) * 10) solid transparent;
    width: 100%;
  }
  #computer-neck {
    box-shadow: inset 0px 6px 16px -2px hsl(34, 4%, 25%);
    height: calc(var(--px) * 30);
    background-color: hsl(41, 5%, 65%);
    width: calc(100% - var(--frame-padding) * 2);
    border-bottom: solid calc(var(--px) * 4) hsl(0, 0%, 45%);
  }

  #computer-base {
    width: 100%;
    height: calc(var(--px) * 60);
    background-color: hsl(34, 15%, 68%);
  }
  // #secHz {
  //   font-size: 30px;
  // }
  // #NANDCalls {
  //   font-size: 22px;
  // }
</style>
