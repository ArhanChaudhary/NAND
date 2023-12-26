<script lang="ts">
  import Computer from "./Computer.svelte";
  import Nav from "./Nav.svelte";
  import { runner } from "./runner-store.js";

  const runner_ = new Worker(
    new URL("./computer-wrapper.ts", import.meta.url),
    { type: "module" }
  );
  runner_.addEventListener("message", (e) => {
    if (e.data.action === "ready") $runner = runner_;
  });
</script>

<Nav />
<main>
  <Computer />
</main>

<!-- no scss because it complains about unused css in normalize.css -->
<style global type="scss">
  @import "normalize.css";
  * {
    box-sizing: border-box;
  }
  main {
    background-color: hsl(0, 0%, 21%);
    display: flex;
    justify-content: center;
    align-items: center;
    height: calc(100dvh - var(--nav-height));
  }
</style>
