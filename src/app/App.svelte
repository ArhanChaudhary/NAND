<script lang="ts">
  import Computer from "./Computer.svelte";
  import Nav from "./Nav.svelte";
  import IDE from "./IDE.svelte";
  import { runner } from "./stores";

  // https://github.com/Menci/vite-plugin-top-level-await?tab=readme-ov-file#workers
  let runner_!: Worker;
  if (import.meta.env.DEV) {
    runner_ = new Worker(new URL("./computer-wrapper.ts", import.meta.url), {
      type: "module",
    });
  } else {
    runner_ = new Worker(new URL("./computer-wrapper.ts", import.meta.url), {
      type: "classic",
    });
  }
  runner_.addEventListener("message", (e) => {
    if (e.data.action === "ready") $runner = runner_;
  });

  let computer_vw = 40;
  let computer_width = (computer_vw * window.innerWidth) / 100;
  computer_width = Math.min(
    window.innerWidth - 300,
    Math.max(700, computer_width)
  );
  computer_vw = (computer_width / window.innerWidth) * 100;

  let mouse_is_down = false;
  function dividerMouseDown() {
    mouse_is_down = true;
  }

  document.addEventListener("mousemove", (e) => {
    if (!mouse_is_down) return;
    let ratio = e.clientX / window.innerWidth;
    if (ratio < 0.1) {
      ratio = 0;
    } else if (ratio > 0.9) {
      ratio = 1;
    }
    computer_vw = (1 - ratio) * 100;
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
    color: hsl(0, 0%, 83%);
    font-family: monospace;
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
  }
</style>
