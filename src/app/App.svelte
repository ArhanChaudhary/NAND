<script lang="ts">
  import Computer from "./Computer.svelte";
  import Nav from "./Nav.svelte";
  import IDE from "./IDE.svelte";
  import MemoryView from "./MemoryView.svelte";
  import questionMarkIcon from "/question-mark.svg?raw";
  import About from "./About.svelte";
  import CompilerError from "./CompilerError.svelte";
  import Alert from "./Alert.svelte";
  import { detect } from "detect-browser";

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
  const browser = detect();
  let showBrowserWarning = false;
  if (browser && browser.name === "safari") {
    const version = browser.version.split(".");
    const major = Number(version[0]);
    const minor = Number(version[1]);
    const patch = Number(version[2]);
    if (
      major < 17 ||
      (major === 17 && minor < 4) ||
      (major === 17 && minor === 4 && patch < 1)
    ) {
      showBrowserWarning = true;
    }
  }
</script>

<svelte:document
  on:mousemove={mousemove}
  on:mouseup={mouseup}
  on:touchmove={touchmove}
  on:touchend={touchend}
/>
{#if showBrowserWarning}
  <Alert bind:showAlert={showBrowserWarning}>
    <h1>Warning</h1>
    <p>
      Safari versions below 17.4.1 have a <a
        href="https://bugs.webkit.org/show_bug.cgi?id=267808">bug</a
      > that may cause the screen to render incorrectly. Please use a different browser
      or update your Apple device if this happens
    </p>
  </Alert>
{/if}
{#if showAbout}
  <About bind:showAbout />
{/if}
<CompilerError />
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
        left: -15px;
        height: 100%;
        width: calc(100% + 30px);
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
      width: 40px;
      left: 10px;
      bottom: 10px;
      background-color: rgba(0, 0, 0, 0.5);
      color: red;
      display: flex;
      align-items: center;
      justify-content: center;
    }
  }
</style>
