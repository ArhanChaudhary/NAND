<script lang="ts" context="module">
  const examplePrograms: Array<{
    exampleProgramName: string;
    exampleProgramData: Array<{
      fileName: string;
      file: string[];
    }>;
  }> = [];
  async function loadExamplePrograms() {
    const exampleProgramPromises = [];
    for (const [exampleProgramPath, exampleProgramFileLoader] of Object.entries(
      import.meta.glob("../example-programs/**/*.jack", { as: "raw" })
    )) {
      const exampleProgramName =
        exampleProgramPath.split("/")[exampleProgramPath.split("/").length - 2];
      exampleProgramPromises.push(
        exampleProgramFileLoader().then((exampleProgramFileRaw) => {
          const exampleProgramFile = exampleProgramFileRaw.split("\n");
          const exampleProgramDatum = examplePrograms.find(
            (exampleProgram) =>
              exampleProgram.exampleProgramName === exampleProgramName
          );
          const exampleProgramFileName = exampleProgramPath
            .split("/")
            [exampleProgramPath.split("/").length - 1].replace(".jack", "");
          const exampleProgramFileDatum = {
            fileName: exampleProgramFileName,
            file: exampleProgramFile,
          };
          if (exampleProgramDatum) {
            exampleProgramDatum.exampleProgramData.push(
              exampleProgramFileDatum
            );
          } else {
            examplePrograms.push({
              exampleProgramName,
              exampleProgramData: [exampleProgramFileDatum],
            });
          }
        })
      );
    }
    await Promise.all(exampleProgramPromises);
    const exampleProgramsOrder = [
      "HelloWorld",
      "Average",
      "Pong",
      "Square",
      "Static",
      "Overflow",
      "2048",
      "GeneticAlgorithm",
    ];
    function safeIndexOf(arr: string[], val: string) {
      const index = arr.indexOf(val);
      if (index === -1) throw new Error("not found");
      return index;
    }
    examplePrograms.sort((a, b) => {
      if (
        safeIndexOf(exampleProgramsOrder, a.exampleProgramName) <
        safeIndexOf(exampleProgramsOrder, b.exampleProgramName)
      )
        return -1;
      if (
        safeIndexOf(exampleProgramsOrder, a.exampleProgramName) >
        safeIndexOf(exampleProgramsOrder, b.exampleProgramName)
      )
        return 1;
      throw new Error("same name");
    });
    for (const exampleProgram of examplePrograms) {
      const mainFileDatum = exampleProgram.exampleProgramData.find(
        (fileDatum) => fileDatum.fileName === "Main"
      );
      if (!mainFileDatum) throw new Error("Main file not found");
      exampleProgram.exampleProgramData = [
        mainFileDatum,
        ...exampleProgram.exampleProgramData.filter(
          (fileDatum) => fileDatum.fileName !== "Main"
        ),
      ];
    }
    return examplePrograms;
  }
  let exampleProgramLoader = loadExamplePrograms();
</script>

<script lang="ts">
  import assembler from "../assembler/main";
  import VMTranslator from "../vm/main";
  import compiler from "../compiler/main";
  import { JackOS } from "./Computer.svelte";
  import {
    runner,
    IDEContext,
    shouldResetAndStart,
    activeTabName,
  } from "./stores";

  $: $IDEContext, ($shouldResetAndStart = true);
  exampleProgramLoader.then(() => {
    if (shouldAutoLoad("HelloWorld")) {
      loadExampleProgram("HelloWorld");
    } else {
      $activeTabName = "Main";
    }
  });
  function shouldAutoLoad(exampleProgramName: string) {
    if (!localStorage.getItem("IDEContext") && exampleProgramName === "HelloWorld") {
      return true;
    } else {
      return null;
    }
  }
  function startRunner() {
    const program = [...$IDEContext];
    program.sort((a, b) => {
      if (a.fileName < b.fileName) return -1;
      if (a.fileName > b.fileName) return 1;
      return 0;
    });
    const VMCode = compiler(program);
    const assembly = VMTranslator(VMCode);
    const machineCode = assembler(assembly);
    if (machineCode.length >= 32768) {
      alert(
        `Program of length ${machineCode.length} too large to load into memory.`
      );
      return;
    }
    $runner.postMessage({
      action: $shouldResetAndStart ? "resetAndStart" : "start",
      machineCode,
    });
    $shouldResetAndStart = false;
  }
  function stopRunner() {
    $runner.postMessage({ action: "stop" });
  }
  function resetRunner() {
    $runner.postMessage({ action: "reset" });
  }
  function speedRunner(e: Event) {
    $runner.postMessage({
      action: "speed",
      speed: (e.target as HTMLInputElement).valueAsNumber,
    });
  }
  function exampleProgramSelectChange(e: Event) {
    loadExampleProgram((e.target as HTMLSelectElement).value);
  }
  function loadExampleProgram(exampleProgramName: string) {
    const exampleProgram = examplePrograms.find(
      (exampleProgram) =>
        exampleProgram.exampleProgramName === exampleProgramName
    );
    if (!exampleProgram) return;

    $IDEContext = structuredClone([
      ...exampleProgram.exampleProgramData,
      ...JackOS.filter(
        (OSFile) =>
          !exampleProgram.exampleProgramData.find(
            (exampleProgramFile) =>
              exampleProgramFile.fileName === OSFile.fileName
          )
      ),
    ]);
    $activeTabName = "Main";
  }
</script>

<nav>
  <img id="logo" alt="" src="logo.png" draggable="false" />
  <button on:click={startRunner}> Start </button>
  <button on:click={stopRunner}> Stop </button>
  <button on:click={resetRunner}> Reset </button>
  <div class="nav-divider"></div>
  <div id="speed-runner-container">
    <input
      id="speed-runner"
      type="range"
      min="0"
      max="100"
      value="100"
      on:input={speedRunner}
    />
    <span>Slow</span>
    <span style="float: right">Fast</span>
  </div>
  <div class="nav-divider"></div>
  <span>
    <select on:change={exampleProgramSelectChange}>
      {#await exampleProgramLoader}
        <option label="Loading..."></option>
      {:then}
        <option label="----"></option>
        {#each examplePrograms as exampleProgram}
          <option
            value={exampleProgram.exampleProgramName}
            selected={shouldAutoLoad(exampleProgram.exampleProgramName)}
          >
            {exampleProgram.exampleProgramName}
          </option>
        {/each}
      {/await}
    </select>
    <div>Load example program</div>
  </span>
  <a id="gh-logo-container" href="https://github.com/ArhanChaudhary/NAND">
    <span></span><img alt="" src="github-mark.png" draggable="false" />
  </a>
</nav>

<style lang="scss">
  :root {
    --nav-height: 60px;
  }

  nav {
    display: flex;
    align-items: center;
    position: relative;
    overflow-x: scroll;
    overflow-y: hidden;
    z-index: 1;
    gap: 30px;
    width: 100%;
    height: var(--nav-height);
    background-color: hsl(220, 10%, 12%);

    #logo {
      padding: 5px;
      height: 100%;
    }

    button {
      background-color: transparent;
      border: none;
      cursor: pointer;
      height: 100%;
    }

    .nav-divider {
      border-left: 2px dotted hsl(220, 7%, 70%);
      height: calc(100% - 20px);
    }

    #speed-runner-container {
      padding-top: 3px;

      #speed-runner {
        display: block;
        -webkit-appearance: none;
        appearance: none;
        background: transparent;
        cursor: pointer;
        margin-bottom: 3px;
      }

      #speed-runner::-webkit-slider-runnable-track {
        background: hsl(222, 25%, 40%);
        border-radius: 0.325rem;
        height: 9px;
      }

      #speed-runner::-moz-range-track {
        background: hsl(222, 25%, 40%);
        border-radius: 0.325rem;
        height: 9px;
      }

      #speed-runner::-webkit-slider-thumb {
        -webkit-appearance: none;
        appearance: none;
        margin-top: -2.5px;
        background-color: hsl(222, 30%, 70%);
        height: 13px;
        width: 13px;
        border-radius: 50%;
      }

      #speed-runner::-moz-range-thumb {
        border: none; /*Removes extra border that FF applies*/
        border-radius: 50%; /*Removes default border-radius that FF applies*/
        background-color: hsl(222, 30%, 70%);
        height: 13px;
        width: 13px;
      }
    }

    > :nth-child(2) {
      margin-left: -10px;
    }

    select {
      background: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='14' height='7' fill='white'><path d='M0 0 7 7 14 0 12 0 7 5 2 0'/></svg>")
        no-repeat;
      background-color: hsl(222, 25%, 40%);
      width: 100%;
      background-position: right 3px top 55%;
      background-repeat: no-repeat;
      background-size: 10px;
      border: none;

      -webkit-appearance: none;
      appearance: none;
      cursor: pointer;
      padding: 2px 16px 2px 4px !important;

      + div {
        margin-top: 4px;
        white-space: nowrap;
      }
    }

    #gh-logo-container {
      margin-left: auto;
      height: 100%;
      white-space: nowrap;

      span {
        display: inline-block;
        width: 0px;
        height: 0px;
        border-style: solid;
        border-width: 0 var(--nav-height) var(--nav-height) 0;
        border-color: transparent white transparent transparent;
      }

      img {
        background-color: white;
        padding: 5px;
        height: 100%;
      }
    }
  }
</style>
