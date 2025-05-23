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
      import.meta.glob<boolean, string, string>(
        "../example-programs/**/*.jack",
        {
          query: "?raw",
          import: "default",
        }
      )
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
      "Program Template",
      "Average",
      "Pong",
      "2048",
      "Overflow",
      "SecretPassword",
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
        ...exampleProgram.exampleProgramData
          .filter((fileDatum) => fileDatum.fileName !== "Main")
          .sort((a, b) => {
            if (a.fileName < b.fileName) return -1;
            if (a.fileName > b.fileName) return 1;
            return 0;
          }),
      ];
    }
    return examplePrograms;
  }
  const exampleProgramLoader = loadExamplePrograms();
</script>

<script lang="ts">
  import assembler, { BaseAssemblerError } from "../assembler/main";
  import VMTranslator from "../vm/main";
  import compiler from "../compiler/main";
  import { CompilerError } from "../compiler/exceptions";
  import {
    JackOS,
    startComputer,
    resetAndStartComputer,
    stopAndResetComputer,
    stopComputer,
    speedComputer,
    stepComputer,
    resetComputer,
  } from "./Computer.svelte";
  import {
    IDEContext,
    shouldResetAndStart,
    activeTabName,
    ROM,
    compilerError,
    computerIsRunning,
  } from "./stores";
  import { tick } from "svelte";
  import { VMTranslatorError } from "../vm/main";

  $: {
    $IDEContext;
    $shouldResetAndStart = true;
  }
  exampleProgramLoader.then(() => {
    if (shouldAutoLoad("Program Template")) {
      loadExampleProgram("Program Template");
    } else {
      $activeTabName = $IDEContext[0]?.fileName;
    }
  });

  function shouldAutoLoad(exampleProgramName: string) {
    if (
      !localStorage.getItem("IDEContext") &&
      exampleProgramName === "Program Template"
    ) {
      return true;
    } else {
      return null;
    }
  }

  function displayCompilerError(compilerError: CompilerError) {
    console.log("Compilation unsuccessful :(");
    $activeTabName = $IDEContext.some(
      (file) => file.fileName === compilerError.getFileName()
    )
      ? compilerError.getFileName()
      : $IDEContext[0]?.fileName;
    tick().then(() => {
      document.querySelector(".line.compilerErrorLine")?.scrollIntoView({
        block: "center",
      });
    });
  }

  function compileAndStartComputer() {
    if (!$shouldResetAndStart) {
      startComputer();
      return;
    }

    let VMCodes;
    let assembly;
    let machineCode;
    if ($IDEContext.length) {
      let program = [...$IDEContext];
      VMCodes = compiler(program, true);
      if (VMCodes instanceof CompilerError) {
        $compilerError = VMCodes;
        displayCompilerError($compilerError);
        return;
      }
    } else {
      VMCodes = $ROM.VMCodes;
    }
    if (VMCodes.length) {
      assembly = VMTranslator(VMCodes);
      if (assembly instanceof VMTranslatorError) {
        $compilerError = assembly;
        displayCompilerError($compilerError);
        return;
      }
    } else {
      assembly = $ROM.assembly;
    }
    if (assembly.length) {
      machineCode = assembler(assembly);
      if (machineCode instanceof BaseAssemblerError) {
        $compilerError = machineCode;
        displayCompilerError($compilerError);
        return;
      }
    } else {
      machineCode = $ROM.machineCode;
    }
    console.log("Compilation successful! :D");
    $ROM.VMCodes = VMCodes;
    $ROM.assembly = assembly;
    $ROM.machineCode = machineCode;

    resetAndStartComputer(machineCode);
    $shouldResetAndStart = false;
  }

  function _resetComputer() {
    // not DRY but idc
    let VMCodes;
    let assembly;
    let machineCode;
    if ($IDEContext.length) {
      let program = [...$IDEContext];
      VMCodes = compiler(program, true);
      if (VMCodes instanceof CompilerError) {
        $compilerError = VMCodes;
        displayCompilerError($compilerError);
        return;
      }
    } else {
      VMCodes = $ROM.VMCodes;
    }
    if (VMCodes.length) {
      assembly = VMTranslator(VMCodes);
      if (assembly instanceof VMTranslatorError) {
        $compilerError = assembly;
        displayCompilerError($compilerError);
        return;
      }
    } else {
      assembly = $ROM.assembly;
    }
    if (assembly.length) {
      machineCode = assembler(assembly);
      if (machineCode instanceof BaseAssemblerError) {
        $compilerError = machineCode;
        displayCompilerError($compilerError);
        return;
      }
    } else {
      machineCode = $ROM.machineCode;
    }
    console.log("Compilation successful! :D");
    $ROM.VMCodes = VMCodes;
    $ROM.assembly = assembly;
    $ROM.machineCode = machineCode;

    resetComputer(machineCode);
    $shouldResetAndStart = false;
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
    $compilerError = null;
    $activeTabName = "";
    $activeTabName = "Main";
  }

  function removeCursorOnSafari() {
    // hero of the day: https://stackoverflow.com/a/55652503/12230735
    // woohoo for safari!!
    const fakeInput = document.createElement("input");
    fakeInput.setAttribute("type", "text");
    fakeInput.setAttribute("readonly", "readonly");
    fakeInput.style.position = "fixed";
    fakeInput.style.opacity = "0";
    fakeInput.style.height = "0";
    fakeInput.style.fontSize = "16px"; // disable auto zoom
    document.body.prepend(fakeInput);
    fakeInput.focus();
    fakeInput.remove();
  }
</script>

<nav>
  <a id="logo" href="/">
    <img alt="" src="/logo.png" draggable="false" width="46.64" height="50" />
  </a>
  <button on:click={removeCursorOnSafari} on:click={compileAndStartComputer}>
    Start
  </button>
  <button
    on:click={removeCursorOnSafari}
    on:click={() => {
      if ($computerIsRunning) {
        stopComputer();
      } else if ($shouldResetAndStart) {
        _resetComputer();
      } else {
        stepComputer();
      }
    }}
  >
    {$computerIsRunning ? "Pause" : "Step"}
  </button>
  <button on:click={removeCursorOnSafari} on:click={stopAndResetComputer}>
    Reset
  </button>
  <div class="nav-divider"></div>
  <div id="speed-runner-container">
    <input
      id="speed-runner"
      type="range"
      min="0"
      max="100"
      value="100"
      on:keydown|stopPropagation
      on:input={(e) => {
        // @ts-ignore
        speedComputer(e.target.valueAsNumber);
      }}
    />
    <span>Slow</span>
    <span style="float: right">Fast</span>
  </div>
  <div class="nav-divider"></div>
  <span>
    <select
      on:change={(e) => {
        // @ts-ignore
        loadExampleProgram(e.target.value);
      }}
    >
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
    <span></span><img
      alt=""
      src="/github-mark.png"
      width="60"
      height="60"
      draggable="false"
    />
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
    scrollbar-width: none;

    &::-webkit-scrollbar {
      width: 0;
      height: 0;
    }

    #logo {
      padding: 5px;
      height: 100%;
    }

    button {
      background-color: transparent;
      border: none;
      cursor: pointer;
      width: 5ch;
      flex-shrink: 0;
      height: 100%;
      box-sizing: content-box;
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
