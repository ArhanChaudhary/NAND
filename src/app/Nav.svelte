<script lang="ts" context="module">
  import { runner } from './runner-store'

  let runner_: Worker;
  runner.subscribe(runner => {
    if (runner) {
      runner_ = runner;
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
  function speedRunner(e: Event) {
    runner_.postMessage({ action: 'speed', speed: (e.target as HTMLInputElement).valueAsNumber });
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
  Speed:
  <input type="range" min="0" max="100" value="100" on:input={speedRunner} />
</nav>