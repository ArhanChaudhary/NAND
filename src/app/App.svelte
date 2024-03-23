<script lang="ts">
  import Computer from "./Computer.svelte";
  import Nav from "./Nav.svelte";
  import IDE from "./IDE.svelte";
  import MemoryView from "./MemoryView.svelte";
  import questionMarkIcon from "/question-mark.svg?raw";
  import About from "./About.svelte";

  let computerVW = 40;
  let computerWidth = (computerVW * window.innerWidth) / 100;
  computerWidth = Math.min(
    Math.max(0, window.innerWidth - 300),
    Math.max(700, computerWidth)
  );
  computerVW = (computerWidth / window.innerWidth) * 100;

  let mouseIsDown = false;
  function dividerMouseDown() {
    mouseIsDown = true;
  }

  function dividerMouseMove(clientX: number) {
    let ratio = clientX / (window.innerWidth - memoryViewWidth);
    showMemoryView = true;
    if (ratio < 0.1) {
      ratio = 0;
    } else if (ratio > 0.9) {
      ratio = 1;
      showMemoryView = false;
    }
    computerVW = (1 - ratio) * 100;
  }

  function mousemove(e: MouseEvent) {
    if (!mouseIsDown) return;
    // necessary so the contenteditable doesn't randomly start moving while dragging the divider
    e.preventDefault();
    dividerMouseMove(e.clientX);
  }

  function touchmove(e: TouchEvent) {
    if (!mouseIsDown) return;
    e.preventDefault();
    dividerMouseMove(e.touches[0].clientX);
  }

  function mouseup() {
    mouseIsDown = false;
  }

  function touchend() {
    mouseIsDown = false;
  }

  let memoryViewWidth: number;
  let showAbout = false;
  let showMemoryView = true;
</script>

<svelte:document
  on:mousemove={mousemove}
  on:mouseup={mouseup}
  on:touchmove={touchmove}
  on:touchend={touchend}
/>
{#if showAbout}
  <About bind:showAbout />
{/if}
<Nav />
<main style="--memory-view-width: {memoryViewWidth}px">
  <IDE />
  <!-- svelte-ignore a11y-no-static-element-interactions -->
  <div
    id="divider"
    on:mousedown={dividerMouseDown}
    on:touchstart={dividerMouseDown}
  ></div>
  <Computer {computerVW} />
  <!-- do it this way to preserve its state and not unmount it -->
  <MemoryView bind:memoryViewWidth show={showMemoryView} />
  <!-- svelte-ignore a11y-click-events-have-key-events -->
  <!-- svelte-ignore a11y-no-static-element-interactions -->
  <div
    id="about"
    on:click={() => {
      showAbout = true;
    }}
  >
    {@html questionMarkIcon}
  </div>
</main>

<style global lang="scss">
  @import "normalize.css";
  * {
    box-sizing: border-box;
    color: hsl(0, 0%, 83%);
    // https://qwtel.com/posts/software/the-monospaced-system-ui-css-font-stack/
    font-family: ui-monospace, Menlo, Monaco, "Cascadia Mono", "Segoe UI Mono",
      "Roboto Mono", "Oxygen Mono", "Ubuntu Monospace", "Source Code Pro",
      "Fira Mono", "Droid Sans Mono", "Courier New", monospace;
    font-size: 13px;
  }

  main {
    // some shadows can overflow and cause scroll
    overflow: hidden;
    display: flex;
    --main-height: calc(100dvh - var(--nav-height));
    height: var(--main-height);

    #divider {
      min-width: 2px;
      position: relative;
      height: var(--main-height);
      background-color: hsl(222, 12%, 45%);
      transition: background-color 0.15s linear;
      cursor: col-resize;
      touch-action: none;
      box-shadow: 0 0 8px 2px black;

      &::after {
        content: "";
        position: absolute;
        z-index: 1;
        top: 0;
        left: -10px;
        height: 100%;
        width: calc(100% + 20px);
      }

      &:hover,
      &:active {
        background-color: hsl(222, 75%, 60%);
      }
    }

    #about {
      cursor: pointer;
      position: absolute;
      border-radius: 50%;
      aspect-ratio: 1;
      width: 50px;
      left: 10px;
      bottom: 10px;
      background-color: hsl(198, 17%, 9%);
      color: red;
      display: flex;
      align-items: center;
      justify-content: center;
    }
  }
</style>
