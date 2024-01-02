<script lang="ts">
  import Computer from "./Computer.svelte";
  import Nav from "./Nav.svelte";
  import IDE from "./IDE.svelte";
  import { runner } from "./runner-store.js";

  const runner_ = new Worker(
    new URL("./computer-wrapper.ts", import.meta.url),
    { type: "module" }
  );
  runner_.addEventListener("message", (e) => {
    if (e.data.action === "ready") $runner = runner_;
  });

  let computer_vw = 35;
  let mouse_is_down = false;
  function dividerMouseDown() {
    mouse_is_down = true;
  }

  document.addEventListener("mousemove", (e) => {
    if (!mouse_is_down) return;
    computer_vw = (1 - Math.max(0, e.clientX / window.innerWidth)) * 100;
  });

  document.addEventListener("mouseup", () => {
    mouse_is_down = false;
  });
</script>

<Nav />
<main>
  <IDE />
  <!-- svelte-ignore a11y-no-static-element-interactions -->
  <div id="divider" on:mousedown={dividerMouseDown}></div>
  <Computer {computer_vw} />
</main>

<style global lang="scss">
  @import "normalize.css";
  * {
    box-sizing: border-box;
    color: lightgray;
    font-family: monospace;
  }

  main {
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
        left: -5px;
        height: 100%;
        width: calc(100% + 10px);
      }

      &:hover,
      &:active {
        background-color: hsl(222, 75%, 60%);
      }
    }

  }
</style>
