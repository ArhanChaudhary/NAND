<script lang="ts">
  import VirtualList from "svelte-tiny-virtual-list";
  import { computerMemory } from "./stores";
  import { onMount } from "svelte";

  export let memoryViewWidth: number;
  const ramMemoryLength = $computerMemory.ramMemory.length;
  const screenMemoryLength = $computerMemory.screenMemory.length;
  const itemCount = ramMemoryLength + screenMemoryLength + 1;
  let memoryView: HTMLDivElement;
  let memoryViewHeader: HTMLDivElement;
  let height: number;
  onMount(() => {
    height = memoryView.clientHeight - memoryViewHeader.offsetHeight;
    window.addEventListener("resize", () => {
      height = memoryView.clientHeight - memoryViewHeader.offsetHeight;
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

  let toDisplaySelect: string;
  function toDisplay(n: number) {
    switch (toDisplaySelect) {
      case "dec":
        return n;
      case "hex":
        return n.toString(16).toUpperCase().padStart(4, "0");
      case "bin":
        return n.toString(2).padStart(16, "0");
    }
  }
  $: {
    if (toDisplaySelect === "bin") {
      memoryViewWidth = 200;
    } else {
      memoryViewWidth = 130;
    }
  }

  let collapsed = false;
  let oldMemoryViewWidth: number;
  function toggleCollapse() {
    if (collapsed) {
      memoryViewWidth = oldMemoryViewWidth;
    } else {
      oldMemoryViewWidth = memoryViewWidth;
      memoryViewWidth = 0;
    }
    collapsed = !collapsed;
  }
</script>

<!-- svelte-ignore a11y-no-static-element-interactions -->
<div
  id="memory-view"
  bind:this={memoryView}
  on:keydown|stopPropagation
  on:keyup|stopPropagation
  style="width: {memoryViewWidth}px"
>
  <!-- svelte-ignore a11y-click-events-have-key-events -->
  <div id="memory-view-collapse" on:click={toggleCollapse} class:collapsed>
    <div id="arrow-1"></div>
    <div id="arrow-2"></div>
  </div>
  <div id="memory-view-header" bind:this={memoryViewHeader}>
    RAM
    <select id="memory-select-display" bind:value={toDisplaySelect}>
      <option value="dec">Dec</option>
      <option value="hex">Hex</option>
      <option value="bin">Bin</option>
    </select>
    <input
      id="goto-input"
      type="number"
      placeholder="Goto:"
      min="0"
      max="24576"
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
      {#key toDisplaySelect}
        {#key $computerMemory}
          <span>{toDisplay(getMemory(index))}</span>
        {/key}
      {/key}
    </div>
  </VirtualList>
</div>

<style lang="scss">
  #memory-view {
    flex-shrink: 0;
    text-align: right;
    font-size: 20px;
    background-color: black;
    position: relative;

    #memory-view-collapse {
      cursor: pointer;
      width: 37px;
      aspect-ratio: 1;
      position: absolute;
      top: 0;
      right: 100%;
      background-color: black;
      display: flex;
      align-items: center;
      flex-flow: column;
      justify-content: center;
      gap: 7px;
      box-shadow: 0 0 4px -1px black;

      div {
        width: 15px;
        height: 2px;
        background-color: hsl(198, 2%, 85%);
      }

      #arrow-1 {
        transform: rotate(45deg);
      }

      #arrow-2 {
        transform: rotate(-45deg);
      }

      &.collapsed {
        #arrow-1 {
          transform: rotate(-45deg);
        }

        #arrow-2 {
          transform: rotate(45deg);
        }
      }
    }

    #memory-view-header {
      background-color: hsl(0, 0%, 0%);
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      line-height: 30px;
      font-size: 16px;
      border: 5px solid black;
      text-align: left;

      #memory-select-display {
        background-color: black;
        border-radius: 3px;
        border: 1px solid hsl(0, 0%, 80%);
        background: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='14' height='7' fill='white'><path d='M0 0 7 7 14 0 12 0 7 5 2 0'/></svg>")
          no-repeat;
        background-position: right 3px top 55%;
        background-repeat: no-repeat;
        background-size: 10px;
        -webkit-appearance: none;
        appearance: none;
        cursor: pointer;
        padding: 2px 16px 2px 4px !important;
      }

      #goto-input {
        width: 100%;
        background-color: hsl(198, 2%, 20%);
        height: 31px;
        border: none;
        margin-top: 3px;
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
      background-color: hsl(198, 8%, 13%);
    }
    &.c2,
    &.c4,
    &.c6 {
      background-color: hsl(198, 18%, 8%);
    }
  }
</style>
