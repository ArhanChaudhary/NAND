<script lang="ts">
  import Computer from './Computer.svelte';

  import { onMount } from 'svelte';
  import { runner } from './runner-store.js';

  onMount(async () => {
    const runner_ = new Worker(new URL('./computer-wrapper.ts', import.meta.url), { type: "module" });
    await new Promise<void>(resolve => {
      runner_.addEventListener('message', e => {
        switch (e.data.action) {
          case 'ready':
            resolve();
            break;
        }
      });
    });
    runner.set(runner_);
  });
</script>

<!-- no scss because it complains about unused css in normalize.css -->
<style>
  @import 'normalize.css';
  main {
    background-color: tan;
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100dvh;
  }
</style>

<main>
  <Computer />
</main>
