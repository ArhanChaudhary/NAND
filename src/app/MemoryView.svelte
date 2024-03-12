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
  let height: number;
  onMount(() => {
    height = memoryView.clientHeight - 25;
    window.addEventListener("resize", () => {
      height = memoryView.clientHeight - 25;
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

  function itemSize(index: number) {
    if (
      [
        16,
        256,
        2048,
        ramMemoryLength,
        ramMemoryLength + screenMemoryLength,
      ].includes(index)
    ) {
      return 40;
    } else {
      return 20;
    }
  }

  let scrollToIndex: number;
  function gotoInput(e: Event) {
    const input = e.target as HTMLInputElement;
    const value = parseInt(input.value);
    if (value >= 0 && value < itemCount) {
      scrollToIndex = value;
    }
  }
</script>

<div id="memory-view" bind:this={memoryView}>
  <div id="memory-view-header">
    RAM <input
      id="goto-input"
      type="number"
      placeholder="Goto:"
      on:input={gotoInput}
    />
  </div>
  <VirtualList
    width="100%"
    {height}
    {itemCount}
    {itemSize}
    {scrollToIndex}
    scrollToAlignment="start"
  >
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
      {#if index === 16}
        <span class="memory-section">Static vars</span>
      {:else if index === 256}
        <span class="memory-section">Stack memory</span>
      {:else if index === 2048}
        <span class="memory-section">Heap memory</span>
      {:else if index === ramMemoryLength}
        <span class="memory-section">Screen memory</span>
      {:else if index === ramMemoryLength + screenMemoryLength}
        <span class="memory-section">Pressed key</span>
      {/if}
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

    #memory-view-header {
      background-color: hsl(0, 0%, 0%);
      font-size: 15px;
      height: 25px;
      line-height: 25px;

      #goto-input {
        width: calc(100% - 3ch - 20px);
        background-color: hsl(198, 2%, 20%);
        height: 25px;
        border: none;
      }
    }

    :global(.virtual-list-wrapper) {
      scrollbar-width: none;

      &::-webkit-scrollbar {
        display: none;
      }
    }
  }

  .memory-list-slot {
    display: flex;
    justify-content: space-between;
    flex-wrap: wrap;
    line-height: 20px;
    padding-left: 5px;
    padding-right: 8px;

    .memory-section {
      width: 100%;
      text-align: center;
      white-space: nowrap;
    }

    .memory-list-index {
      width: 5ch;
      text-align: center;
    }

    &.c1,
    &.c3,
    &.c5 {
      background-color: hsl(198, 18%, 8%);
    }
    &.c2,
    &.c4,
    &.c6 {
      background-color: hsl(198, 18%, 2%);
    }
  }
</style>
