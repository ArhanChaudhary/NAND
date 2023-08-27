<script lang="ts" context="module">
  import assembler from '../assembler/main';
  import VMTranslator from '../vm/main';
  import compiler from '../compiler/main';

  import { OS } from './Computer.svelte';

  import { runner } from './runner-store'

  let runner_: Worker;
  runner.subscribe(runner => {
    if (runner) {
      runner_ = runner;
    }
  });
  function startRunner() {
    runner_.postMessage({ action: 'start' });
  }
  function stopRunner() {
    runner_.postMessage({ action: 'stop' });
  }
  function resetRunner() {
    runner_.postMessage({ action: 'reset' });
  }
  function speedRunner(e: Event) {
    runner_.postMessage({ action: 'speed', speed: (e.target as HTMLInputElement).valueAsNumber });
  }

  const examplePrograms: Array<{
    exampleProgramName: string,
    exampleProgramData: Array<{
      fileName: string,
      file: string[]
    }>
  }> = [];
  for (const [exampleProgramPath, exampleProgramFileLoader] of Object.entries(
    import.meta.glob('../example-programs/**/*.jack', { as: 'raw' })
  )) {
    const exampleProgramName = exampleProgramPath.split('/')[exampleProgramPath.split('/').length - 2];
    const exampleProgramDatum = examplePrograms.find(exampleProgram => exampleProgram.exampleProgramName === exampleProgramName);
    const exampleProgramFile = (await exampleProgramFileLoader()).split('\n');
    const exampleProgramFileName = exampleProgramPath.split('/')[exampleProgramPath.split('/').length - 1].replace('.jack', '');
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

  function loadExampleProgram(e: Event) {
    runner_.postMessage({ action: 'reset' });
    const exampleProgramName = (e.target as HTMLSelectElement).value;
    const exampleProgram = examplePrograms.find(exampleProgram => exampleProgram.exampleProgramName === exampleProgramName);
    const VMCode = compiler(exampleProgram.exampleProgramData);
    VMCode.push(...OS);
    const assembly = VMTranslator(VMCode);
    const machineCode = assembler(assembly);
    runner_.postMessage({ action: 'loadROM', machineCode });
  }
</script>

<style>
  nav {
    position: absolute;
    top: 0;
    width: 100%;
    height: 60px;
    background-color: lightslategray;
  }
</style>

<nav>
  <button on:click={startRunner}>
    Start
  </button>
  <button on:click={stopRunner}>
    Stop
  </button>
  <button on:click={resetRunner}>
    Reset
  </button>
  Speed:
  <input type="range" min="0" max="100" value="100" on:input={speedRunner} />
  Load example program:
  <select on:change={loadExampleProgram}>
    <option label="----"></option>
    {#each examplePrograms as exampleProgram}
      <option value={exampleProgram.exampleProgramName}>{exampleProgram.exampleProgramName}</option>
    {/each}
  </select>
</nav>