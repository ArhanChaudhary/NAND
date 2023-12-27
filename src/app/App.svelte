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
</script>

<Nav />
<main>
  <IDE />
  <Computer />
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
  }
</style>
