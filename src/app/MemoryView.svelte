<script lang="ts">
  import VirtualList from "svelte-tiny-virtual-list";
  import type { Alignment } from "svelte-tiny-virtual-list";
  import {
    IDEContext,
    ROM,
    activeTabName,
    compilerError,
    computerIsRunning,
    computerMemory,
  } from "./stores";
  import { onMount, tick } from "svelte";
  import compiler from "../compiler/main";
  import { BroadCompilerError, CompilerError } from "../compiler/exceptions";
  import VMTranslator from "../vm/main";
  import assembler, { BaseAssemblerError } from "../assembler/main";
  import { clearRAM, JackOS, stopComputer } from "./Computer.svelte";
  import { VMTranslatorError } from "../vm/main";

  export let show: boolean;
  export let memoryViewWidth: number;
  const ramMemoryLength = $computerMemory.ramMemory.length;
  const screenMemoryLength = $computerMemory.screenMemory.length;
  const RAMLength = ramMemoryLength + screenMemoryLength + 1;
  let itemCount: number;
  let memoryView: HTMLDivElement;
  let memoryViewHeader: HTMLDivElement;
  let virtualList: VirtualList;
  let fileInput: HTMLInputElement;
  let height: number;
  let memoryDisplay: string;
  let memoryDisplayType: string;
  let scrollToIndex: number | undefined;
  let highlightIndex: number | undefined;
  let pcToAssembly = new Array<number>();
  let assemblyToVMCode = new Array<number | null>();
  let VMCodeStarts = new Array<number>();
  let scrollToAlignment: Alignment;
  let followPC = false;
  const onMountAsync = new Promise<void>(onMount);

  async function loadUserFiles(e: Event) {
    const reader = new FileReader();
    const files = (e.target as HTMLInputElement).files as FileList;

    let prevFileExtension: string | undefined;
    const programFiles = new Array<{ fileName: string; file: string[] }>();

    for (let i = 0; i < files.length; i++) {
      await new Promise<void>((resolve) => {
        reader.onload = resolve.bind(null, undefined);
        reader.readAsText(files[i]);
      });

      const fileContent = reader.result as string;
      const [fileName, fileExtension] = files[i].name.split(".");

      if (
        !fileExtension ||
        !["jack", "vm", "asm", "hack"].includes(fileExtension)
      ) {
        alert("Only .jack, .vm, .asm, and .hack files are supported.");
        // after alert so load is still visible
        memoryDisplayType = "rom";
        return;
      }
      if (
        prevFileExtension !== undefined &&
        prevFileExtension !== fileExtension
      ) {
        alert("Only one file type is supported at a time.");
        // after alert so load is still visible
        memoryDisplayType = "rom";
        return;
      }
      prevFileExtension = fileExtension;

      programFiles.push({
        fileName,
        file: fileContent.split("\n"),
      });
    }
    tick().then(() => {
      memoryDisplayType = "rom";
    });

    if (!programFiles.length || prevFileExtension === undefined) {
      alert("No files loaded.");
      return;
    }

    const filteredJackOS = JackOS.filter(
      (OSFile) =>
        !programFiles.find(
          (programFile) => programFile.fileName === OSFile.fileName
        )
    );

    $IDEContext =
      prevFileExtension === "jack" ? programFiles.concat(filteredJackOS) : [];
    $activeTabName = "";
    $activeTabName = "Main";

    let VMCodes;
    let assembly;
    let machineCode;
    switch (prevFileExtension) {
      case "jack":
        VMCodes = compiler(programFiles.concat(filteredJackOS), true);
        if (VMCodes instanceof CompilerError) {
          $compilerError = VMCodes;
          return;
        }
      case "vm":
        if (!VMCodes) {
          VMCodes = compiler(filteredJackOS, false).concat(
            programFiles.map((file) => ({
              fileName: file.fileName,
              VMCode: file.file,
            }))
          );
        }
        assembly = VMTranslator(VMCodes);
        if (assembly instanceof VMTranslatorError) {
          $compilerError = assembly;
          return;
        }
      case "asm":
        if (!assembly) {
          if (programFiles.length !== 1) {
            alert("Only one .asm file is supported.");
            return;
          }
          assembly = programFiles[0].file;
        }
        machineCode = assembler(assembly);
        if (machineCode instanceof BaseAssemblerError) {
          $compilerError = machineCode;
          return;
        }
      case "hack":
        if (!machineCode) {
          if (programFiles.length !== 1) {
            alert("Only one .hack file is supported.");
            return;
          }
          machineCode = programFiles[0].file
            .map((line) => line.trim())
            // remove new lines
            .filter((line) => line);
          for (const instruction of machineCode) {
            if (!/^[01]{16}$/.test(instruction)) {
              $compilerError = new BroadCompilerError(
                "",
                "Invalid .hack file format: expected sixteen 0s or 1s per line"
              );
              return;
            }
          }
        }
        console.log("Compilation successful! :D");
        $ROM.VMCodes = VMCodes || [];
        $ROM.assembly = assembly || [];
        $ROM.machineCode = machineCode;
    }
  }

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
      case "hex": {
        const hex = mem.toString(16).toUpperCase().padStart(4, "0");
        return `${hex.slice(0, 2)} ${hex.slice(2)}`;
      }
      case "bin": {
        const bin = mem.toString(2).padStart(16, "0");
        return `${bin.slice(0, 8)} ${bin.slice(8)}`;
      }
    }
  }

  function memoryIndexToDisplay(i: number) {
    switch (memoryDisplayType) {
      case "ram": {
        let mem: number;
        if (i < ramMemoryLength) {
          mem = $computerMemory.ramMemory[i];
        } else if (i < ramMemoryLength + screenMemoryLength) {
          mem = $computerMemory.screenMemory[i - ramMemoryLength];
        } else {
          mem = $computerMemory.pressedKey;
        }
        return RAMToDisplay(mem);
      }
      case "rom":
        switch (memoryDisplay) {
          case "bin": {
            let ret = $ROM.machineCode[i];
            if (!ret) return "00000000 00000000";
            ret = ret.trim();
            return `${ret.slice(0, 8)} ${ret.slice(8)}`;
          }
          case "asm":
            return $ROM.assembly[i].trim();
          case "vm": {
            const foundIndex = indexOfVMCodeStarts(i);
            return $ROM.VMCodes[foundIndex].VMCode[
              i - VMCodeStarts[foundIndex]
            ].trim();
          }
        }
        break;
    }
  }

  function indexOfVMCodeStarts(i: number) {
    let foundIndex = 0;
    let left = 0;
    let right = VMCodeStarts.length - 1;
    while (left <= right) {
      const mid = Math.floor((left + right) / 2);
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
            }
            return 20;
        }
    }
    return 0;
  }

  function gotoInput(e: Event) {
    const value = (e.target as HTMLInputElement).value.toLowerCase();
    const valueAsNumber = Number(value);
    if (!Number.isNaN(valueAsNumber)) {
      scrollToAlignment = "start";
      scrollToIndex = valueAsNumber;
    } else if (memoryDisplayType === "rom" && memoryDisplay === "vm") {
      const foundIndex = $ROM.VMCodes.findIndex((VMCode) =>
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
        if ($ROM.VMCodes.length) {
          memoryDisplay = "vm";
        } else if ($ROM.assembly.length) {
          memoryDisplay = "asm";
        } else {
          memoryDisplay = "bin";
        }
        break;
      case "load":
        fileInput.click();
        break;
    }
    await onMountAsync;
    scrollToIndex = 0;
    virtualList.recomputeSizes(0);
  }

  function promptClearRAM() {
    if (memoryDisplay !== "clr") return;
    memoryDisplay = "dec";
    if ($computerIsRunning) {
      stopComputer();
    }
    // wait for lights to turn red
    // theres definitely a better way to await this
    setTimeout(() => {
      if (confirm("Are you sure you want to clear the RAM?")) {
        clearRAM();
      }
    }, 100);
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
  // inherently tied to memoryDisplay, prioritize first
  $: memoryDisplay, promptClearRAM();

  // order should be agnotic
  $: {
    pcToAssembly = $ROM.assembly.reduce((acc, assembly, index) => {
      if (!assembly.startsWith("(")) {
        const commentIndex = assembly.indexOf("//");
        if (commentIndex !== -1) {
          assembly = assembly.slice(0, commentIndex);
        }
        if (assembly.trim()) {
          acc.push(index);
        }
      }
      return acc;
    }, new Array<number>());
    if ($ROM.VMCodes.length) {
      VMCodeStarts = $ROM.VMCodes.slice(0, -1).reduce(
        (acc, VMCode) => [...acc, acc[acc.length - 1] + VMCode.VMCode.length],
        [0]
      );
      assemblyToVMCode = $ROM.assembly.reduce((acc, assembly) => {
        const commentIndex = assembly.indexOf("//");
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
          while (true) {
            const actualVMCodeIndex = indexOfVMCodeStarts(expectedVMCodeIndex);
            const expectedVMCode = assembly.slice(commentIndex + 3);
            let actualVMCode =
              $ROM.VMCodes[actualVMCodeIndex].VMCode[
                expectedVMCodeIndex - VMCodeStarts[actualVMCodeIndex]
              ].trim();
            const VMCodeCommentIndex = actualVMCode.indexOf("//");
            if (VMCodeCommentIndex !== -1) {
              actualVMCode = actualVMCode.slice(0, VMCodeCommentIndex);
            }
            if (expectedVMCode === actualVMCode) {
              break;
            }
            expectedVMCodeIndex++;
          }
          acc.push(expectedVMCodeIndex);
        }
        return acc;
      }, new Array<number | null>());
    }
  }

  // order should be agnotic
  let scrollToIndexTimeout: NodeJS.Timeout;
  $: if (memoryDisplayType === "rom") {
    switch (memoryDisplay) {
      case "bin":
        highlightIndex = $computerMemory.pcRegister;
        break;
      case "asm":
        highlightIndex = pcToAssembly[$computerMemory.pcRegister];
        break;
      case "vm": {
        const ret = assemblyToVMCode[pcToAssembly[$computerMemory.pcRegister]];
        if (ret === null) {
          // throttle disabling highlight so it doesnt disable when fast
          // but does when slow
          scrollToIndexTimeout = setTimeout(() => {
            highlightIndex = undefined;
          }, 50);
        } else {
          clearTimeout(scrollToIndexTimeout);
          highlightIndex = ret;
        }
        break;
      }
    }
    if (followPC) {
      scrollToIndex = undefined;
      tick().then(() => {
        scrollToAlignment = "center";
        scrollToIndex = highlightIndex;
      });
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
    switch (memoryDisplayType) {
      case "rom":
        switch (memoryDisplay) {
          case "bin":
            itemCount = $ROM.machineCode.length || 32768;
            break;
          case "asm":
            itemCount = $ROM.assembly.length;
            break;
          case "vm":
            itemCount = $ROM.VMCodes.map(
              (VMCode) => VMCode.VMCode.length
            ).reduce((a, b) => a + b, 0);
            break;
        }
        break;
      case "ram":
        itemCount = RAMLength;
        break;
      case "load":
        itemCount = 0;
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
        <select
          class="memory-select"
          bind:value={memoryDisplayType}
          on:change={(e) => {
            // @ts-ignore
            e.target.blur();
          }}
        >
          <option value="ram">RAM</option>
          <option value="rom">ROM</option>
          <option value="load">Load</option>
        </select>
        {#if memoryDisplayType !== "load"}
          <select
            class="memory-select"
            bind:value={memoryDisplay}
            on:change={(e) => {
              // @ts-ignore
              e.target.blur();
            }}
          >
            {#if memoryDisplayType === "ram"}
              <option value="dec">Dec</option>
              <option value="hex">Hex</option>
            {/if}
            {#if memoryDisplayType === "rom"}
              <option value="vm">VM</option>
              <option value="asm">Asm</option>
            {/if}
            <option value="bin">Bin</option>
            {#if memoryDisplayType === "ram"}
              <option value="clr">Clr</option>
            {/if}
          </select>
        {/if}
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
    <input
      bind:this={fileInput}
      id="file-input"
      hidden
      type="file"
      multiple
      on:cancel={() => (memoryDisplayType = "ram")}
      on:change={loadUserFiles}
      on:click={(e) => {
        // @ts-ignore
        e.target.value = "";
      }}
    />
    {#if memoryDisplayType === "load"}
      <label id="file-input-label" for="file-input">Load file(s)</label>
    {/if}
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

    #file-input-label {
      position: absolute;
      z-index: 1;
      right: 0;
      left: 0;
      background: hsl(0, 0%, 83%);
      display: block;
      border-radius: 5px;
      margin: 4px 13px;
      color: black;
      line-height: 2em;
      text-align: center;
      outline: 1px solid hsl(0, 0%, 50%);
      cursor: pointer;

      &:hover {
        background: hsl(0deg 0% 75%);
        transform: translateY(1px);
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
