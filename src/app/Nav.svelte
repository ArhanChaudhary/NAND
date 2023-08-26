<script lang="ts">
  import { onMount } from "svelte";
  import { runner } from './runner-store'

  let runner_: Worker;
  onMount(async () => {
    if (!runner_) {
      await new Promise<void>(resolve => {
        runner.subscribe(runner => {
          if (runner) {
            runner_ = runner;
            resolve();
          }
        });
      });
    }
  });
  function startRunner() {
    runner_.postMessage({ action: 'start' });
  }
  function stopRunner() {
    runner_.postMessage({ action: 'stop' });
  }
  function resetRunner() {
    runner_.postMessage({ action: 'reset' });
  }
</script>
<style>
  nav {
    position: absolute;
    top: 0;
    width: 100%;
    height: 60px;
    background-color: lightslategray;
  }
</style>

<nav>
  <button on:click={startRunner}>
    Start
  </button>
  <button on:click={stopRunner}>
    Stop
  </button>
  <button on:click={resetRunner}>
    Reset
  </button>
</nav>