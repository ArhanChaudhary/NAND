<script lang="ts">
  import Computer from "./Computer.svelte";
  import Nav from "./Nav.svelte";
  import IDE from "./IDE.svelte";
  import MemoryView from "./MemoryView.svelte";
  import questionMarkIcon from "/question-mark.svg?raw";
  import About from "./About.svelte";

  let computerVW = 40;
  let memoryViewWidth = 130;
  let computerAndIDEWidth = window.innerWidth - memoryViewWidth;
  let computerWidth = (computerVW * computerAndIDEWidth) / 100;
  computerWidth = Math.min(
    Math.max(0, computerAndIDEWidth - 300),
    Math.max(700, computerWidth)
  );
  computerVW = (computerWidth / computerAndIDEWidth) * 100;

  let mouseIsDown = false;
  function dividerMouseDown() {
    mouseIsDown = true;
  }

  document.addEventListener("mousemove", (e) => {
    if (!mouseIsDown) return;
    let ratio = (e.clientX + memoryViewWidth) / window.innerWidth;
    if (ratio < 0.1) {
      ratio = 0;
    } else if (ratio > 0.9) {
      ratio = 1;
    }
    computerVW = (1 - ratio) * 100;
  });

  document.addEventListener("mouseup", () => {
    mouseIsDown = false;
  });

  let showAbout = false;
</script>

{#if showAbout}
  <About bind:showAbout />
{/if}
<Nav />
<main>
  <IDE />
  <!-- svelte-ignore a11y-no-static-element-interactions -->
  <div id="divider" on:mousedown={dividerMouseDown}></div>
  <Computer {computerVW} />
  <MemoryView bind:memoryViewWidth />
  <!-- svelte-ignore a11y-click-events-have-key-events -->
  <!-- svelte-ignore a11y-no-static-element-interactions -->
  <div id="about" on:click={() => {showAbout = true}}>
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
      width: 40px;
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
