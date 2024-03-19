<script lang="ts">
  import VirtualList from "svelte-tiny-virtual-list";
  import { ROM, computerMemory } from "./stores";
  import { onMount } from "svelte";

  export let show: boolean;
  export let memoryViewWidth: number;
  const ramMemoryLength = $computerMemory.ramMemory.length;
  const screenMemoryLength = $computerMemory.screenMemory.length;
  const RAMLength = ramMemoryLength + screenMemoryLength + 1;
  let itemCount: number;
  let memoryView: HTMLDivElement;
  let memoryViewHeader: HTMLDivElement;
  let height: number;
  let memoryDisplay: string;
  let memoryDisplayType: string;

  let onMountAsync = new Promise<void>(onMount);
  onMountAsync.then(() => {
    height = memoryView.clientHeight - memoryViewHeader.offsetHeight;
    window.addEventListener("resize", () => {
      height = memoryView.clientHeight - memoryViewHeader.offsetHeight;
    });
  });

  function memoryToDisplay(i: number) {
    switch (memoryDisplayType) {
      case "ram":
        let ret: number;
        if (i < ramMemoryLength) {
          ret = $computerMemory.ramMemory[i];
        } else if (i < ramMemoryLength + screenMemoryLength) {
          ret = $computerMemory.screenMemory[i - ramMemoryLength];
        } else {
          ret = $computerMemory.pressedKey;
        }
        switch (memoryDisplay) {
          case "dec":
            return ret;
          case "hex":
            let hex = ret.toString(16).toUpperCase().padStart(4, "0");
            return hex.slice(0, 2) + " " + hex.slice(2);
          case "bin":
            let bin = ret.toString(2).padStart(16, "0");
            return bin.slice(0, 8) + " " + bin.slice(8);
        }
        break;
      case "rom":
        switch (memoryDisplay) {
          case "bin":
            let ret = $ROM.machineCode[i];
            return ret.slice(0, 8) + " " + ret.slice(8);
          case "asm":
            return $ROM.assembly[i];
          // case "vm":
          //   itemCount = $ROM.VMCode.length;
          //   return $ROM.VMCode[i];
        }
        break;
    }
  }

  function itemSize(index: number) {
    if (
      memoryDisplayType !== "rom" &&
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
    if (value >= 0) {
      scrollToIndex = Math.min(itemCount - 1, value);
    }
  }

  let virtualList: VirtualList;
  $: memoryDisplayType, memoryDisplayTypeChanged();
  function memoryDisplayTypeChanged() {
    memoryDisplay = "bin";
    onMountAsync.then(() => virtualList.recomputeSizes());
  }

  $: {
    switch (memoryDisplay) {
      case "asm":
        memoryViewWidth = 300;
        break;
      case "bin":
      case "vm":
        memoryViewWidth = 210;
        break;
      default:
        memoryViewWidth = 130;
    }
    switch (memoryDisplayType) {
      case "rom":
        switch (memoryDisplay) {
          case "bin":
            itemCount = $ROM.machineCode.length;
            break;
          case "asm":
            itemCount = $ROM.assembly.length;
            break;
          // case "vm":
          //  itemCount = $ROM.VMCode.length;
          //   return $ROM.VMCode[i];
        }
        break;
      case "ram":
        itemCount = RAMLength;
        break;
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
{#if show}
  <div
    id="memory-view"
    bind:this={memoryView}
    on:keydown|stopPropagation
    on:keyup|stopPropagation
  >
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <div id="memory-view-collapse" on:click={toggleCollapse} class:collapsed>
      <div id="arrow-1"></div>
      <div id="arrow-2"></div>
    </div>
    <div id="memory-view-header" bind:this={memoryViewHeader}>
      <div id="memory-selects">
        <select class="memory-select" bind:value={memoryDisplayType}>
          <option value="ram">RAM</option>
          <option value="rom">ROM</option>
        </select>
        <select class="memory-select" bind:value={memoryDisplay}>
          {#if memoryDisplayType === "ram"}
            <option value="dec">Dec</option>
            <option value="hex">Hex</option>
          {/if}
          <option value="bin">Bin</option>
          {#if memoryDisplayType === "rom"}
            <option value="asm">Asm</option>
            <option value="vm">VM</option>
          {/if}
        </select>
      </div>
      <input
        id="goto-input"
        type="number"
        placeholder="Goto:"
        min="0"
        max={itemCount - 1}
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
      bind:this={virtualList}
    >
      <div
        slot="item"
        let:index
        let:style
        {style}
        class="memory-list-slot"
        class:c1={(memoryDisplayType !== "rom" && index < 16) ||
          (256 <= index && index < 2048) ||
          (ramMemoryLength <= index &&
            index < ramMemoryLength + screenMemoryLength)}
        class:c2={memoryDisplayType === "rom" ||
          (16 <= index && index < 256) ||
          (2048 <= index && index < ramMemoryLength) ||
          index === ramMemoryLength + screenMemoryLength}
        class:wrap={memoryDisplayType !== "rom" &&
          [
            16,
            256,
            2048,
            ramMemoryLength,
            ramMemoryLength + screenMemoryLength,
          ].includes(index)}
        class:align-left={["asm", "vm"].includes(memoryDisplay)}
      >
        {#if memoryDisplayType !== "rom"}
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
        {/if}
        <span class="memory-list-index">{index}</span>
        {#key memoryDisplay}
          {#if memoryDisplayType === "ram"}
            {#key $computerMemory}
              <span>{memoryToDisplay(index)}</span>
            {/key}
          {:else}
            {#key $ROM}
              <span>{memoryToDisplay(index)}</span>
            {/key}
          {/if}
        {/key}
      </div>
    </VirtualList>
  </div>
{/if}

<style lang="scss">
  #memory-view {
    flex-shrink: 0;
    text-align: right;
    font-size: 20px;
    background-color: black;
    position: relative;
    width: var(--memory-view-width);

    #memory-view-collapse {
      cursor: pointer;
      width: 37px;
      aspect-ratio: 1;
      position: absolute;
      top: 0;
      right: 100%;
      z-index: 1;
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
      border: 5px solid black;
      border-top: none;

      #memory-selects {
        display: flex;
        align-items: center;
        height: 37px;
        font-size: 16px;
        justify-content: space-between;

        .memory-select {
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
      }

      #goto-input {
        font-size: 16px;
        width: 100%;
        background-color: hsl(198, 2%, 20%);
        height: 30px;
        border: none;

        &::placeholder {
          color: hsl(0, 0%, 70%);
        }
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
    line-height: 20px;
    padding-left: 5px;
    padding-right: 8px;

    &.align-left {
      display: initial;
      text-align: left;
      white-space: nowrap;
      overflow-x: auto;
      scrollbar-width: none;

      &::-webkit-scrollbar {
        width: 0;
        height: 0;
      }

      .memory-list-index {
        display: inline-block;
      }
    }

    &.wrap {
      flex-wrap: wrap;
    }

    .memory-section {
      width: 100%;
      text-align: center;
      white-space: nowrap;
    }

    .memory-list-index {
      width: 5ch;
      text-align: center;
    }

    &.c1 {
      background-color: hsl(198, 8%, 13%);
    }

    &.c2 {
      background-color: hsl(198, 18%, 8%);
    }
  }
</style>
