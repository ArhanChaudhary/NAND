<script lang="ts" context="module">
  // export const JackOS: Array<{ fileName: string; file: string[] }> = [];

  // for (const [OSFilePath, OSFile] of Object.entries(
  //   import.meta.glob("../os/*.jack", { as: "raw" })
  // )) {
  //   JackOS.push({
  //     fileName: OSFilePath.replace("../os/", "").replace(".jack", ""),
  //     file: ((await OSFile()) as string).split("\n"),
  //   });
  // }

  export const JackOS: Array<{ fileName: string; file: string[] }> =
    await Promise.all(
      Object.entries(import.meta.glob("../os/*.jack", { as: "raw" })).map(
        async ([OSFilePath, OSFile]) => ({
          fileName: OSFilePath.replace("../os/", "").replace(".jack", ""),
          file: ((await OSFile()) as string).split("\n"),
        })
      )
    );

  function initRunner(
    runner: Worker,
    messageHandler: {
      (e: { data: any }): void;
      (this: Worker, ev: MessageEvent<any>): any;
    }
  ) {
    const offscreen = document
      .querySelector("canvas")
      .transferControlToOffscreen();
    runner.postMessage({ action: "initialize", canvas: offscreen }, [
      offscreen,
    ]);
    runner.addEventListener("message", messageHandler);

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
      runner.postMessage({ action: "keyboard", key: keyValue });
    });

    document.addEventListener("keyup", () => {
      prev = 0;
      runner.postMessage({ action: "keyboard", key: 0 });
    });
  }
</script>

<script lang="ts">
  import { runner } from "./stores";
  import { onMount } from "svelte";
  export let computer_vw: Number;

  let computerWrapper: HTMLDivElement;
  onMount(() => {
    computerWrapper.style.setProperty(
      "--computer-wrapper-aspect-ratio",
      computerWrapper.clientWidth / computerWrapper.clientHeight + ""
    );
  });

  let clockSpeed = "0";
  let NANDCalls = "0";
  let lightStatus = "";
  function messageHandler(e: { data: any }) {
    switch (e.data.action) {
      case "emitInfo":
        if (e.data.hz >= 100_000) {
          clockSpeed = Number(e.data.hz / 1_000_000).toPrecision(3) + " MHz";
        } else if (e.data.hz >= 1_000) {
          clockSpeed = Number(e.data.hz / 1_000).toPrecision(3) + " KHz";
        } else {
          clockSpeed = Number(e.data.hz).toPrecision(3) + " Hz";
        }
        if (e.data.NANDCalls > 45_000_000_000n) {
          lightStatus = "green";
        } else if (e.data.NANDCalls === 0n) {
          lightStatus = "";
        } else {
          lightStatus = "loading";
        }
        if (e.data.NANDCalls >= 1_000_000_000_000n) {
          NANDCalls =
            Number((e.data.NANDCalls * 1000n) / 1_000_000_000_000n) / 1000 +
            " trillion";
        } else if (e.data.NANDCalls >= 1_000_000_000n) {
          NANDCalls =
            Number((e.data.NANDCalls * 10n) / 1_000_000_000n) / 10 + " billion";
        } else if (e.data.NANDCalls >= 1_000_000n) {
          NANDCalls = Number(e.data.NANDCalls / 1_000_000n) + " million";
        } else {
          NANDCalls = "0";
        }
        break;
      case "stopRunner":
        lightStatus = "red";
    }
  }
  $: $runner && initRunner($runner, messageHandler);
</script>

<div
  id="computer-container"
  style="--computer-container-width: {computer_vw}vw;"
>
  <div id="computer-wrapper" bind:this={computerWrapper}>
    <div id="computer-frame">
      <canvas width="512" height="256" />
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

    #computer-wrapper {
      --px: calc(
        min(
            var(--computer-container-width) - 30px,
            (var(--main-height) - 30px) *
              var(--computer-wrapper-aspect-ratio, 1)
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

        canvas {
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
