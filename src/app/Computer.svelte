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
  <div id="computer-bottom"></div>
  <div id="computer-hanger-wrapper">
    <div id="computer-hanger"></div>
    <div id="computer-hanger-bottom"></div>
  </div>
  <div id="computer-holder"></div>
</div>

<style lang="scss">
  #computer-wrapper {
    object-fit: contain;
    --frame-padding: 65px;
    flex-flow: column;
    display: flex;
    align-items: center;
  }
  #computer-frame {
    // box-shadow: inset 0px 5px 10px -4px black, inset 5px 0px 10px -4px black, inset -5px 0px 10px -4px black;
    background-color:hsl(41, 25%, 77%);
    padding: var(--frame-padding);
  }
  #canvas-wrapper {
    padding: 0px;
    background: hsl(0, 0%, 85%);
    border: 15px solid;
    // border-color: hsl(34, 11%, 57%) hsl(34, 13%, 64%) hsl(40, 16%, 71%);
    border-color: hsl(34, 11%, 57%) hsl(34, 15%, 68%) hsl(40, 42%, 87%);
  }
  canvas {
    image-rendering: pixelated;
    image-rendering: crisp-edges;
    background: hsl(0, 0%, 7%);
    display: block;
    aspect-ratio: 2 / 1;
    width: 650px;
  }
  #computer-bottom {
    border-top: 8px solid hsl(34, 8%, 50%);
    border-left: 10px solid transparent;
    border-right: 10px solid transparent;
    width: 100%;
  }
  #computer-hanger-wrapper {
    width: calc(100% - var(--frame-padding) * 2);
  }
  #computer-hanger {
    box-shadow: inset 0px 6px 16px -2px hsl(34, 4%, 25%);
    height: 30px;
    background-color:hsl(41, 5%, 65%);
  }
  #computer-hanger-bottom {
    border-top: 4px solid hsl(0, 0%, 45%);
    border-left: 4px solid transparent;
    border-right: 4px solid transparent;
    width: 100%;
  }
  #computer-holder {

  }
  // #secHz {
  //   font-size: 30px;
  // }
  // #NANDCalls {
  //   font-size: 22px;
  // }
</style>
