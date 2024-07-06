<script lang="ts">
  import VirtualList, { type Alignment } from "svelte-tiny-virtual-list";
  import { ROM, computerIsRunning, computerMemory } from "./stores";
  import { onMount } from "svelte";

  export let show: boolean;
  export let memoryViewWidth: number;
  const ramMemoryLength = $computerMemory.ramMemory.length;
  const screenMemoryLength = $computerMemory.screenMemory.length;
  const RAMLength = ramMemoryLength + screenMemoryLength + 1;
  let itemCount: number;
  let memoryView: HTMLDivElement;
  let memoryViewHeader: HTMLDivElement;
  let virtualList: VirtualList;
  let height: number;
  let memoryDisplay: string;
  let memoryDisplayType: string;
  let scrollToIndex: number | undefined;
  let highlightIndex: number;
  let pcToAssembly: number[];
  let assemblyToVMCode: (number | null)[];
  let VMCodeStarts: number[] = [];
  let scrollToAlignment: Alignment;
  let followPC = false;
  let onMountAsync = new Promise<void>(onMount);

  async function windowResize() {
    await onMountAsync;
    height = memoryView.clientHeight - memoryViewHeader.offsetHeight;
  }

  function RAMToDisplay(mem: number) {
    switch (memoryDisplay) {
      case "dec":
        if (mem >= 32768) {
          mem -= 65536;
        }
        return mem.toString();
      case "hex":
        let hex = mem.toString(16).toUpperCase().padStart(4, "0");
        return hex.slice(0, 2) + " " + hex.slice(2);
      case "bin":
        let bin = mem.toString(2).padStart(16, "0");
        return bin.slice(0, 8) + " " + bin.slice(8);
    }
  }

  function memoryIndexToDisplay(i: number) {
    switch (memoryDisplayType) {
      case "ram":
        let mem: number;
        if (i < ramMemoryLength) {
          mem = $computerMemory.ramMemory[i];
        } else if (i < ramMemoryLength + screenMemoryLength) {
          mem = $computerMemory.screenMemory[i - ramMemoryLength];
        } else {
          mem = $computerMemory.pressedKey;
        }
        return RAMToDisplay(mem);
      case "rom":
        switch (memoryDisplay) {
          case "bin": {
            let ret = $ROM.machineCode[i];
            return ret.slice(0, 8) + " " + ret.slice(8);
          }
          case "asm": {
            let ret = $ROM.assembly[i];
            let commentIndex = ret.indexOf("//");
            return commentIndex === -1 ? ret : ret.slice(0, commentIndex);
          }
          case "vm":
            let foundIndex = indexOfVMCodeStarts(i);
            return $ROM.VMCodes[foundIndex].VMCode[
              i - VMCodeStarts[foundIndex]
            ];
        }
        break;
    }
  }

  function indexOfVMCodeStarts(i: number) {
    let foundIndex = 0;
    let left = 0;
    let right = VMCodeStarts.length - 1;
    while (left <= right) {
      let mid = Math.floor((left + right) / 2);
      if (VMCodeStarts[mid] <= i) {
        foundIndex = mid;
        left = mid + 1;
      } else {
        right = mid - 1;
      }
    }
    return foundIndex;
  }

  function itemSize(i: number) {
    switch (memoryDisplayType) {
      case "ram":
        switch (i) {
          case 0:
            return 80;
          case 16:
          case 256:
          case 2048:
          case ramMemoryLength:
          case ramMemoryLength + screenMemoryLength:
            return 40;
          default:
            return 20;
        }
      case "rom":
        switch (memoryDisplay) {
          case "bin":
          case "asm":
            return 20;
          case "vm":
            if (VMCodeStarts.includes(i)) {
              return 40;
            } else {
              return 20;
            }
        }
    }
    return 0;
  }

  function gotoInput(e: Event) {
    const value = (e.target as HTMLInputElement).value.toLowerCase();
    let valueAsNumber = Number(value);
    if (!Number.isNaN(valueAsNumber)) {
      scrollToAlignment = "start";
      scrollToIndex = valueAsNumber;
    } else if (memoryDisplayType === "rom" && memoryDisplay === "vm") {
      let foundIndex = $ROM.VMCodes.findIndex((VMCode) =>
        VMCode.fileName.toLowerCase().startsWith(value)
      );
      if (foundIndex !== -1) {
        scrollToAlignment = "start";
        scrollToIndex = VMCodeStarts[foundIndex];
      }
    }
  }

  async function memoryDisplayTypeChanged() {
    switch (memoryDisplayType) {
      case "ram":
        memoryDisplay = "dec";
        break;
      case "rom":
        // make sure to change the itemCount thing if this is changed
        memoryDisplay = "vm";
        break;
      case "load":
        let a = document.createElement("input");
        a.type = "file";
        a.click();
        break;
    }
    await onMountAsync;
    virtualList.recomputeSizes(0);
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

  function toggleCollapseOnPress(e: KeyboardEvent) {
    if (e.key === "Enter" || e.key === " ") {
      toggleCollapse();
    }
  }

  $: memoryDisplayType, windowResize();
  // inherently tied to memoryDisplayType, prioritize first
  // to ensure memoryDisplay and memoryDisplayType don't desync
  $: memoryDisplayType, memoryDisplayTypeChanged();

  // order should be agnotic
  $: {
    if ($ROM.VMCodes.length) {
      VMCodeStarts = $ROM.VMCodes.slice(0, -1).reduce(
        (acc, VMCode) => [...acc, acc[acc.length - 1] + VMCode.VMCode.length],
        [0]
      );
    }
    pcToAssembly = $ROM.assembly.reduce((acc, assembly, index) => {
      if (!assembly.startsWith("(")) {
        acc.push(index);
      }
      return acc;
    }, [] as number[]);
    assemblyToVMCode = $ROM.assembly.reduce(
      (acc, assembly) => {
        let commentIndex = assembly.indexOf("//");
        if (commentIndex === -1) {
          if (acc.length) {
            acc.push(acc[acc.length - 1]);
          } else {
            acc.push(null);
          }
        } else {
          let expectedVMCodeIndex: number;
          if (acc[acc.length - 1] === null) {
            expectedVMCodeIndex = 0;
          } else {
            expectedVMCodeIndex = (acc[acc.length - 1] as number) + 1;
          }
          acc.push(expectedVMCodeIndex);
          let actualVMCodeIndex = indexOfVMCodeStarts(expectedVMCodeIndex);
          if (
            assembly.slice(commentIndex + 3) !==
            $ROM.VMCodes[actualVMCodeIndex].VMCode[
              expectedVMCodeIndex - VMCodeStarts[actualVMCodeIndex]
            ]
          ) {
            throw new Error("mismatched VM command");
          }
        }
        return acc;
      },
      [] as (number | null)[]
    );
  }

  // order should be agnotic
  $: {
    scrollToAlignment;
    if (memoryDisplayType === "rom" && followPC && $computerIsRunning) {
      scrollToAlignment = "center";
    }
  }

  // order should be agnotic
  $: if (memoryDisplayType === "rom") {
    switch (memoryDisplay) {
      case "bin":
        highlightIndex = $computerMemory.pcRegister;
        break;
      case "asm":
        highlightIndex = pcToAssembly[$computerMemory.pcRegister];
        break;
      case "vm":
        let ret = assemblyToVMCode[pcToAssembly[$computerMemory.pcRegister]];
        if (ret !== null) {
          highlightIndex = ret;
        }
        break;
    }
    if (followPC) {
      scrollToIndex = highlightIndex;
    }
  }

  // order should be agnostic
  $: {
    switch (memoryDisplay) {
      case "bin":
        memoryViewWidth = 210;
        break;
      case "asm":
      case "vm":
        memoryViewWidth = 270;
        break;
      default:
        memoryViewWidth = 150;
    }
  }

  // order should be agnostic
  $: {
    switch (memoryDisplayType) {
      case "rom":
        switch (memoryDisplay) {
          case "bin":
            itemCount = $ROM.machineCode.length;
            break;
          case "asm":
            itemCount = $ROM.assembly.length;
            break;
          case "vm":
          default:
            itemCount = $ROM.VMCodes.map(
              (VMCode) => VMCode.VMCode.length
            ).reduce((a, b) => a + b, 0);
            break;
        }
        break;
      case "ram":
        itemCount = RAMLength;
        break;
    }
  }

  // order towards the bottom, acts like a post-filter
  $: if (typeof scrollToIndex === "number") {
    if (itemCount === 0) {
      scrollToIndex = undefined;
    } else {
      scrollToIndex = Math.max(0, Math.min(itemCount - 1, scrollToIndex));
    }
  }
</script>

<svelte:window on:resize={windowResize} />

{#if show}
  <!-- svelte-ignore a11y-no-static-element-interactions -->
  <div
    id="memory-view"
    bind:this={memoryView}
    on:keydown|stopPropagation
    on:keyup|stopPropagation
  >
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <!-- svelte-ignore a11y-no-noninteractive-tabindex -->
    <div
      id="memory-view-collapse"
      tabindex="0"
      on:click={toggleCollapse}
      on:keypress={toggleCollapseOnPress}
      class:collapsed
    >
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
          {#if memoryDisplayType === "rom"}
            <option value="vm">VM</option>
            <option value="asm">Asm</option>
          {/if}
          <option value="bin">Bin</option>
        </select>
      </div>
      {#if memoryDisplayType === "rom"}
        <div id="goto-pc-wrapper">
          <input type="checkbox" id="goto-pc" bind:checked={followPC} />
          <label for="goto-pc">Follow PC</label>
        </div>
      {/if}
      <input
        id="goto-input"
        type={memoryDisplayType === "rom" && memoryDisplay === "vm"
          ? "text"
          : "number"}
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
      {scrollToAlignment}
      bind:this={virtualList}
    >
      <div
        slot="item"
        let:index
        let:style
        {style}
        class="memory-list-slot"
        class:c1={(memoryDisplayType === "ram" &&
          (index < 16 ||
            (256 <= index && index < 2048) ||
            (ramMemoryLength <= index &&
              index < ramMemoryLength + screenMemoryLength))) ||
          (memoryDisplayType === "rom" &&
            (["asm", "bin"].includes(memoryDisplay) ||
              (memoryDisplay === "vm" &&
                indexOfVMCodeStarts(index) % 2 === 0)))}
        class:c2={(memoryDisplayType === "ram" &&
          ((16 <= index && index < 256) ||
            (2048 <= index && index < ramMemoryLength) ||
            index === ramMemoryLength + screenMemoryLength)) ||
          (memoryDisplayType === "rom" &&
            (["asm", "bin"].includes(memoryDisplay) ||
              (memoryDisplay === "vm" &&
                indexOfVMCodeStarts(index) % 2 === 1)))}
        class:wrap={memoryDisplayType === "ram" &&
          [
            0,
            16,
            256,
            2048,
            ramMemoryLength,
            ramMemoryLength + screenMemoryLength,
          ].includes(index)}
        class:align-left={["asm", "vm"].includes(memoryDisplay)}
        class:highlight={memoryDisplayType === "rom" &&
          index === highlightIndex}
      >
        {#if memoryDisplayType === "ram"}
          {#if index === 0}
            {#key memoryDisplay}
              <div class="cpu-register">
                <span class="memory-list-index">PC</span>
                <span>{RAMToDisplay($computerMemory.pcRegister)}</span>
              </div>
              <div class="cpu-register">
                <span class="memory-list-index">A</span>
                <span>{RAMToDisplay($computerMemory.aRegister)}</span>
              </div>
              <div class="cpu-register">
                <span class="memory-list-index">D</span>
                <span>{RAMToDisplay($computerMemory.dRegister)}</span>
              </div>
            {/key}
          {:else if index === 16}
            <div class="memory-section">Static vars</div>
          {:else if index === 256}
            <div class="memory-section">Stack memory</div>
          {:else if index === 2048}
            <div class="memory-section">Heap memory</div>
          {:else if index === ramMemoryLength}
            <div class="memory-section">Screen memory</div>
          {:else if index === ramMemoryLength + screenMemoryLength}
            <div class="memory-section">Pressed key</div>
          {/if}
        {:else if memoryDisplayType === "rom" && memoryDisplay === "vm" && VMCodeStarts.includes(index)}
          <div class="memory-section">
            {$ROM.VMCodes[VMCodeStarts.indexOf(index)].fileName}
          </div>
        {/if}
        <span class="memory-list-index">{index}</span><span>
          {#key memoryDisplay}
            {#if memoryDisplayType === "ram"}
              {#key $computerMemory}
                {memoryIndexToDisplay(index)}
              {/key}
            {:else}
              {#key $ROM}
                {memoryIndexToDisplay(index)}
              {/key}
            {/if}
          {/key}
        </span>
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
      padding: 0 5px 5px 5px;

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

      #goto-pc-wrapper {
        display: flex;
        gap: 9px;
        align-items: center;
        height: 30px;
        label {
          font-size: 16px;
        }
      }
    }

    :global(.virtual-list-wrapper) {
      scrollbar-width: none;
      background-color: hsl(197, 10%, 6%);

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

    .cpu-register {
      width: 100%;
      display: flex;
      justify-content: space-between;
    }

    .memory-section {
      width: 100%;
      text-align: center;
      white-space: nowrap;
    }

    .memory-list-index {
      width: 5ch;
      text-align: center;
      margin-right: 2ch;
    }

    &.c1 {
      background-color: hsl(198, 8%, 13%);
    }

    &.c2 {
      background-color: hsl(198, 18%, 8%);
    }

    &.highlight {
      background-color: hsl(198, 9%, 39%);
    }
  }
</style>
