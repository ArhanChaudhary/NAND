<script lang="ts" context="module">
  function toDisplay(n: number) {
    return n;
    return n.toString(16).toUpperCase().padStart(4, "0");
  }
</script>

<script lang="ts">
  import VirtualList from "svelte-tiny-virtual-list";
  import { computerMemory } from "./stores";
  import { onMount } from "svelte";

  const ramMemoryLength = $computerMemory.ramMemory.length;
  const screenMemoryLength = $computerMemory.screenMemory.length;
  const itemCount = ramMemoryLength + screenMemoryLength + 1;
  let memoryView: HTMLDivElement;
  let scrollToIndex: number;
  let height: number;
  onMount(() => {
    height = memoryView.clientHeight;
    window.addEventListener("resize", () => {
      height = window.innerHeight - 50;
    });
  });

  function getMemory(i: number) {
    if (i < ramMemoryLength) {
      return $computerMemory.ramMemory[i];
    } else if (i < ramMemoryLength + screenMemoryLength) {
      return $computerMemory.screenMemory[i - ramMemoryLength];
    } else {
      return $computerMemory.pressedKey;
    }
  }
</script>

<div id="memory-view" bind:this={memoryView}>
  <VirtualList width="100%" {height} {itemCount} itemSize={20}>
    <div
      slot="item"
      let:index
      let:style
      {style}
      class="memory-list-slot"
      class:c1={index < 16}
      class:c2={16 <= index && index < 256}
      class:c3={256 <= index && index < 2048}
      class:c4={2048 <= index && index < ramMemoryLength}
      class:c5={ramMemoryLength <= index &&
        index < ramMemoryLength + screenMemoryLength}
      class:c6={index === ramMemoryLength + screenMemoryLength}
    >
      <span class="memory-list-index">{index}</span>
      {#key $computerMemory}
        <span>{toDisplay(getMemory(index))}</span>
      {/key}
    </div>
  </VirtualList>
</div>

<style lang="scss">
  #memory-view {
    width: var(--memory-view-width);
    flex-shrink: 0;
    text-align: right;
    font-size: 20px;
    background-color: black;
  }

  #memory-view :global(.virtual-list-wrapper) {
    scrollbar-width: none;

    &::-webkit-scrollbar {
      display: none;
    }
  }

  .memory-list-slot {
    display: flex;
    justify-content: space-between;
    line-height: 20px;
    padding-left: 5px;
    padding-right: 8px;

    .memory-list-index {
      width: 5ch;
      text-align: center;
    }

    // &.c1 {
    //   background-color: hsl(198, 36%, 9%);
    // }
    // &.c2 {
    //   background-color: hsl(173, 58%, 13%);
    // }
    // &.c3 {
    //   background-color: hsl(43, 73%, 25%);
    // }
    // &.c4 {
    //   background-color: hsl(27, 88%, 25%);
    // }
    // &.c5 {
    //   background-color: hsl(12, 76%, 23%);
    // }
    // &.c6 {
    //   background-color: black;
    // }
  }
</style>
