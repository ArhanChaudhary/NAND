<script>
  import { computerMemory } from "./stores";
</script>

<div id="memory-view">
  {#each $computerMemory.ramMemory as i}
    <div>{i}</div>
  {/each}
  {#each $computerMemory.screenMemory as i}
    <div>{i}</div>
  {/each}
  <div>{$computerMemory.pressedKey}</div>
</div>

<style>
  #memory-view {
    width: var(--memory-view-width);
    flex-shrink: 0;
    background-color: black;
    color: white;
    overflow-y: scroll;
  }
</style>
