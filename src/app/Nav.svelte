<script lang="ts" context="module">
  const examplePrograms: Array<{
    exampleProgramName: string;
    exampleProgramData: Array<{
      fileName: string;
      file: string[];
    }>;
  }> = [];
  for (const [exampleProgramPath, exampleProgramFileLoader] of Object.entries(
    import.meta.glob("../example-programs/**/*.jack", { as: "raw" })
  )) {
    const exampleProgramName =
      exampleProgramPath.split("/")[exampleProgramPath.split("/").length - 2];
    const exampleProgramDatum = examplePrograms.find(
      (exampleProgram) =>
        exampleProgram.exampleProgramName === exampleProgramName
    );
    const exampleProgramFile = (await exampleProgramFileLoader()).split("\n");
    const exampleProgramFileName = exampleProgramPath
      .split("/")
      [exampleProgramPath.split("/").length - 1].replace(".jack", "");
    const exampleProgramFileDatum = {
      fileName: exampleProgramFileName,
      file: exampleProgramFile,
    };
    if (exampleProgramDatum) {
      exampleProgramDatum.exampleProgramData.push(exampleProgramFileDatum);
    } else {
      examplePrograms.push({
        exampleProgramName,
        exampleProgramData: [exampleProgramFileDatum],
      });
    }
  }
</script>

<script lang="ts">
  import assembler from "../assembler/main";
  import VMTranslator from "../vm/main";
  import compiler from "../compiler/main";
  import { JackOS } from "./Computer.svelte";
  import { runner } from "./runner-store";
  function startRunner() {
    $runner.postMessage({ action: "start" });
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
  function loadExampleProgram(e: Event) {
    resetRunner();
    const exampleProgramName = (e.target as HTMLSelectElement).value;
    const exampleProgram = examplePrograms.find(
      (exampleProgram) =>
        exampleProgram.exampleProgramName === exampleProgramName
    );
    if (!exampleProgram) return;

    const program = [
      ...exampleProgram.exampleProgramData,
      ...JackOS.filter(
        (OSFile) =>
          !exampleProgram.exampleProgramData.find(
            (exampleProgramFile) =>
              exampleProgramFile.fileName === OSFile.fileName
          )
      ),
    ];
    const VMCode = compiler(program);
    const assembly = VMTranslator(VMCode);
    const machineCode = assembler(assembly);
    if (machineCode.length >= 32768) {
      alert(
        `Program of length ${machineCode.length} too large to load into memory.`
      );
      return;
    }
    $runner.postMessage({ action: "loadROM", machineCode });
  }
</script>

<nav>
  <img id="logo" alt="" src="static/logo.png" />
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
  <div id="load-example-program-container">
    <select on:change={loadExampleProgram}>
      <option label="----"></option>
      {#each examplePrograms as exampleProgram}
        <option value={exampleProgram.exampleProgramName}
          >{exampleProgram.exampleProgramName}</option
        >
      {/each}
    </select>
    <div style="margin-top: 4px">Load example program</div>
  </div>
</nav>

<style type="scss">
  :root {
    --nav-height: 60px;
  }

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

  nav {
    display: flex;
    align-items: center;
    gap: 30px;
    width: 100%;
    height: var(--nav-height);
    background-color: hsl(220, 10%, 12%);
  }

  nav > :nth-child(2) {
    margin-left: -10px;
  }

  nav > :last-child {
    margin-right: 4px;
  }

  .nav-divider {
    border-left: 2px dotted hsl(220, 7%, 70%);
    height: calc(100% - 20px);
  }

  #speed-runner-container {
    padding-top: 3px;
  }

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
  }
</style>
