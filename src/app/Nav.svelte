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
  <button on:click={startRunner}> Start </button>
  <button on:click={stopRunner}> Stop </button>
  <button on:click={resetRunner}> Reset </button>
  Speed:
  <input type="range" min="0" max="100" value="100" on:input={speedRunner} />
  Load example program:
  <select on:change={loadExampleProgram}>
    <option label="----"></option>
    {#each examplePrograms as exampleProgram}
      <option value={exampleProgram.exampleProgramName}
        >{exampleProgram.exampleProgramName}</option
      >
    {/each}
  </select>
</nav>

<style>
  :root {
    --nav-height: 60px;
  }
  nav {
    /* position: absolute;
    top: 0; */
    display: block;
    width: 100%;
    height: var(--nav-height);
    background-color: lightslategray;
  }
</style>
