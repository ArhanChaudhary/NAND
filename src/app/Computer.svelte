<script lang="ts" context="module">
  import runtimeInit from "nand-core";
  import { computerIsRunning } from "./stores";

  export let JackOS: {
    fileName: string;
    file: string[];
  }[];
  const loadJackOS = Promise.all(
    Object.entries(
      import.meta.glob<boolean, string, string>("../os/*.jack", {
        query: "?raw",
        import: "default",
      })
    ).map(async ([OSFilePath, OSFile]) => ({
      fileName: OSFilePath.replace("../os/", "").replace(".jack", ""),
      file: (await OSFile()).split("\n"),
    }))
  ).then((OSFiles) => {
    JackOS = OSFiles;
  });

  let computerRunner: Worker;
  let computerKernel: Worker;
  // https://github.com/Menci/vite-plugin-top-level-await?tab=readme-ov-file#workers
  if (import.meta.env.DEV) {
    computerRunner = new Worker(
      new URL("computer-runtime.ts", import.meta.url),
      {
        type: "module",
      }
    );
    computerKernel = new Worker(
      new URL("computer-kernel.ts", import.meta.url),
      {
        type: "module",
      }
    );
  } else {
    computerRunner = new Worker(
      new URL("computer-runtime.ts", import.meta.url),
      {
        type: "classic",
      }
    );
    computerKernel = new Worker(
      new URL("computer-kernel.ts", import.meta.url),
      {
        type: "classic",
      }
    );
  }

  const loadComputerRunner = new Promise<void>((resolve) => {
    computerRunner.addEventListener(
      "message",
      (e) => {
        if (e.data.action === "loaded") {
          resolve();
        }
      },
      { once: true }
    );
  });

  const loadComputerKernel = new Promise<void>((resolve) => {
    computerKernel.addEventListener(
      "message",
      (e) => {
        if (e.data.action === "loaded") {
          resolve();
        }
      },
      { once: true }
    );
  });

  let wasmMemory: WebAssembly.Memory;
  const initializeComputerWasm = runtimeInit()
    .then((resolved: { memory: WebAssembly.Memory }) => {
      wasmMemory = resolved.memory;
    })
    .catch(() => {
      alert(
        "The web page cache is outdated. Please force refresh the page using Cmd + Shift + R"
      );
    });

  const loadComputerRuntime = new Promise<void>(async (resolve) => {
    await Promise.all([initializeComputerWasm, loadComputerRunner]);
    try {
      computerRunner.postMessage({
        wasmModule: (runtimeInit as any).__wbindgen_wasm_module,
        wasmMemory,
      });
    } catch (e) {
      if (e instanceof DOMException) {
        alert(
          "NAND must have self.crossOriginIsolated enabled for usage. This is happening because you either embedded NAND in a cross-origin iframe or misconfigured your response headers."
        );
      }
      throw e;
    }

    computerRunner.addEventListener(
      "message",
      (e) => {
        if (e.data.action === "ready") {
          resolve();
        }
      },
      { once: true }
    );
  });

  await Promise.all([loadJackOS, loadComputerRuntime, loadComputerKernel]);
  export function startComputer() {
    computerIsRunning.set(true);
    computerRunner.postMessage(undefined);
    computerKernel.postMessage({ action: "partialStart" });
  }

  export function resetAndStartComputer(machineCode: string[]) {
    computerIsRunning.set(true);
    computerRunner.postMessage(undefined);
    computerKernel.postMessage({
      action: "resetAndPartialStart",
      machineCode,
    });
  }

  export function stopAndResetComputer() {
    computerIsRunning.set(false);
    computerKernel.postMessage({ action: "stopAndReset" });
  }

  export function stopComputer() {
    computerIsRunning.set(false);
    computerKernel.postMessage({ action: "stop" });
  }

  export function speedComputer(speedPercentage: number) {
    computerKernel.postMessage({ action: "speed", speedPercentage });
  }

  function keyboardComputer(keyValue: number) {
    computerKernel.postMessage({ action: "keyboard", keyValue });
  }
</script>

<script lang="ts">
  import { onMount } from "svelte";
  import { computerMemory } from "./stores";
  export let computerVW: number;

  let computerWrapper: HTMLDivElement;
  let computerWrapperAspectRatio: number | null = null;
  let onMountAsync = new Promise<void>(onMount);
  $: computerVW, updateAspectRatio();
  async function updateAspectRatio() {
    await onMountAsync;
    computerWrapperAspectRatio =
      computerWrapper.clientWidth / computerWrapper.clientHeight || null;
  }

  let clockSpeed = "0.00 Hz";
  let NANDCalls = "0";
  let lightStatus = "";
  let makeRedAfterwards = false;
  function messageHandler(e: { data: any }) {
    switch (e.data.action) {
      case "infoMessage":
        const hardwareInfoMessage = e.data.hardwareInfo;
        if (hardwareInfoMessage.hz >= 100_000) {
          clockSpeed =
            (hardwareInfoMessage.hz / 1_000_000).toPrecision(3) + " MHz";
        } else if (hardwareInfoMessage.hz >= 1_000) {
          clockSpeed = (hardwareInfoMessage.hz / 1_000).toPrecision(3) + " KHz";
        } else {
          clockSpeed =
            Math.round(hardwareInfoMessage.hz).toString().padStart(2, " ") +
            " Hz";
        }
        if (makeRedAfterwards) {
          lightStatus = "red";
          makeRedAfterwards = false;
        } else if (hardwareInfoMessage.NANDCalls > 38_800_000_000) {
          lightStatus = "green";
        } else if (hardwareInfoMessage.NANDCalls === 0) {
          lightStatus = "";
        } else {
          lightStatus = "loading";
        }
        if (hardwareInfoMessage.NANDCalls >= 1_000_000_000_000) {
          NANDCalls =
            Math.round(
              (hardwareInfoMessage.NANDCalls * 1000) / 1_000_000_000_000
            ) /
              1000 +
            " trillion";
        } else if (hardwareInfoMessage.NANDCalls >= 1_000_000_000) {
          NANDCalls =
            Math.round((hardwareInfoMessage.NANDCalls * 10) / 1_000_000_000) /
              10 +
            " billion";
        } else if (hardwareInfoMessage.NANDCalls >= 1_000_000) {
          NANDCalls =
            Math.round(hardwareInfoMessage.NANDCalls / 1_000_000) + " million";
        } else {
          NANDCalls = "0";
        }
        if (e.data.memoryInfo) {
          $computerMemory = e.data.memoryInfo;
        }
        break;
      case "stoppedRuntime":
        // stopRendering might call hardwareInfo one last time so if we set it to
        // red here it might immediately be set to green afterwards otherwise
        lightStatus = "red";
        makeRedAfterwards = true;
        setTimeout(() => {
          makeRedAfterwards = false;
        }, 50);
        computerKernel.postMessage({ action: "partialStop" });
        break;
    }
  }

  let computerScreen: HTMLCanvasElement;
  onMount(initRunner);
  let hasInitRunner = false;
  async function initRunner() {
    const offscreenCanvas = computerScreen.transferControlToOffscreen();
    computerKernel.postMessage(
      {
        action: "screenInit",
        offscreenCanvas,
        wasmModule: (runtimeInit as any).__wbindgen_wasm_module,
        wasmMemory,
      },
      [offscreenCanvas]
    );

    await new Promise<void>((resolve) => {
      computerKernel.addEventListener(
        "message",
        (e) => {
          if (e.data.action === "ready") {
            resolve();
          }
        },
        { once: true }
      );
    });

    computerRunner.addEventListener("message", messageHandler);
    computerKernel.addEventListener("message", messageHandler);
    hasInitRunner = true;
  }

  let prev: number;
  function keydown(e: KeyboardEvent) {
    if (!hasInitRunner) return;
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
    keyboardComputer(keyValue);
  }

  function keyup() {
    if (!hasInitRunner) return;
    prev = 0;
    keyboardComputer(0);
  }
</script>

<svelte:document on:keyup={keyup} on:keydown={keydown} />
<div
  id="computer-container"
  style="--computer-container-width: calc({computerVW} / 100 * (100vw - var(--memory-view-width) - 2px));"
>
  <div
    id="computer-runner"
    style="--computer-runner-aspect-ratio: {computerWrapperAspectRatio}"
    bind:this={computerWrapper}
  >
    <div id="computer-frame">
      <canvas
        id="computer-screen"
        bind:this={computerScreen}
        width="512"
        height="256"
      />
      <div id="computer-frame-graphics-positioner" class={lightStatus}>
        <div class="status-light-gradient">
          <div class="status-light"></div>
        </div>
        <div class="status-light-gradient">
          <div class="status-light"></div>
        </div>
        <div class="status-light-gradient">
          <div class="status-light"></div>
        </div>
        <div id="turn-off-button-positioner">
          <div id="turn-off-button-gradient">
            <div id="turn-off-button"></div>
          </div>
        </div>
      </div>
    </div>
    <div id="computer-frame-bottom"></div>
    <div id="computer-neck">
      <div id="neck-divider"></div>
    </div>
    <div id="computer-base">
      <div id="rom-container">
        <div id="rom-oval"></div>
        <div id="rom-inserter"></div>
      </div>
      <div class="computer-base-divider"></div>
      <span class="empty-space"></span>
      <div class="computer-base-divider"></div>
      <div id="dots-col-wrapper">
        {#each Array(22) as _}
          <div class="dots-col"></div>
        {/each}
      </div>
    </div>
    <div id="secHz">Clock speed: {clockSpeed}</div>
    <div id="NANDCalls">NAND Calls: {NANDCalls}</div>
  </div>
</div>

<style lang="scss">
  #computer-container {
    overflow: hidden;
    position: relative;
    background-color: hsl(222, 19%, 22%);
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;
    min-width: var(--computer-container-width);

    .empty-space {
      flex-grow: 1;
    }

    #computer-runner {
      --px: calc(
        min(
            var(--computer-container-width) - 30px,
            (var(--main-height) - 30px) * var(--computer-runner-aspect-ratio, 1)
          ) / 810
      );
      --frame-padding: calc(var(--px) * 60);
      flex-flow: column;
      display: flex;
      align-items: center;

      #computer-frame {
        background-color: hsl(41, 25%, 77%);
        padding: var(--frame-padding);
        position: relative;

        #computer-screen {
          border: calc(var(--px) * 15) solid;
          border-color: hsl(34, 11%, 57%) hsl(34, 15%, 68%) hsl(40, 42%, 87%);
          image-rendering: pixelated;
          image-rendering: crisp-edges;
          background: hsl(0, 0%, 7%);
          display: block;
          aspect-ratio: 2 / 1;
          width: calc(var(--px) * 680);
        }

        #computer-frame-graphics-positioner {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: calc(var(--px) * 15);
          position: absolute;
          bottom: 0;
          right: 0;
          height: var(--frame-padding);
          --graphic-gradient: linear-gradient(
            hsl(34, 15%, 64%),
            hsl(34, 35%, 90%)
          );

          .status-light-gradient {
            width: calc(var(--px) * 29);
            height: calc(var(--px) * 29);
            border-radius: 50%;
            background: var(--graphic-gradient);
            display: flex;
            align-items: center;
            justify-content: center;

            .status-light {
              width: calc(var(--px) * 20);
              height: calc(var(--px) * 20);
              --red-gradient: radial-gradient(
                hsl(0, 100%, 65%),
                hsl(0, 100%, 15%)
              );
              --green-gradient: radial-gradient(
                hsl(120, 100%, 50%),
                hsl(120, 100%, 10%)
              );
              --default-gradient: radial-gradient(
                hsl(0, 0%, 45%),
                hsl(0, 0%, 5%)
              );
              --background-gradient: var(--default-gradient);
              background-image: var(--background-gradient);
              border-radius: 50%;
            }
          }

          #turn-off-button-positioner {
            height: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
            width: var(--frame-padding);

            #turn-off-button-gradient {
              width: calc(var(--px) * 40);
              height: calc(var(--px) * 40);
              background: var(--graphic-gradient);
              display: flex;
              align-items: center;
              justify-content: center;
              border-radius: 50%;

              #turn-off-button {
                width: calc(var(--px) * 30);
                height: calc(var(--px) * 30);
                border-radius: 50%;
                background-color: hsl(49, 24%, 83%);
                box-shadow: inset 0 0 calc(var(--px) * 8) calc(var(--px) * -3)
                  hsl(0, 0%, 40%);
              }
            }
          }

          &.green .status-light {
            --background-gradient: var(--green-gradient);
          }

          &.red .status-light {
            --background-gradient: var(--red-gradient);
          }

          @for $i from 1 through 3 {
            &.loading .status-light-gradient:nth-child(#{$i}n) .status-light {
              animation: blinker 0.5s step-start #{0.3 - $i * 0.1}s infinite;
            }
          }

          @keyframes blinker {
            50% {
              background: var(--green-gradient);
            }
          }
        }
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
        display: flex;
        justify-content: center;

        #neck-divider {
          position: relative;
          border-left: solid calc(var(--px) * 2) hsl(34, 10%, 35%);
          height: 100%;
        }
      }

      #computer-base {
        width: 100%;
        display: flex;
        align-items: center;
        height: calc(var(--px) * 60);
        background-color: hsl(34, 15%, 68%);

        > :not(.computer-base-divider) {
          margin: 0 calc(var(--px) * 10);
        }

        #dots-col-wrapper {
          display: flex;
          align-items: center;
          height: 100%;
        }

        .dots-col {
          height: calc(100% - var(--px) * 15);
          border-left: calc(var(--px) * 3) dotted hsl(34, 15%, 43%);
          margin-left: calc(var(--px) * 3);
        }

        .computer-base-divider {
          position: relative;
          border-left: solid var(--px) hsl(34, 10%, 35%);
          border-right: solid calc(var(--px) * 2) hsl(34, 15%, 80%);
          height: 100%;
        }

        #rom-container {
          height: 100%;
          width: calc(var(--px) * 300);
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;

          #rom-oval {
            position: absolute;
            width: calc(var(--px) * 85);
            height: calc(var(--px) * 50);
            background: linear-gradient(hsl(34, 11%, 45%), hsl(34, 37%, 85%));
            border-radius: 50%;
          }

          #rom-inserter {
            width: 100%;
            position: relative;
            height: calc(var(--px) * 18);
            background-color: hsl(0, 0%, 10%);
            border: calc(var(--px) * 4) solid;
            border-color: hsl(34, 12%, 58%) hsl(35, 15%, 62%) hsl(37, 17%, 73%);
          }
        }
      }

      #secHz {
        align-self: flex-start;
        margin-top: calc(var(--px) * 3);
        font-size: calc(var(--px) * 30);
      }

      #NANDCalls {
        align-self: flex-start;
        font-size: calc(var(--px) * 22);
      }
    }
  }
</style>
