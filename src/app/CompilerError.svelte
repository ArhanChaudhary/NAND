<script lang="ts">
  import Alert from "./Alert.svelte";
  import { compilerError } from "./stores";

  let showCompilerError = false;
  $: $compilerError, updateShowCompilerError();
  function updateShowCompilerError() {
    showCompilerError = $compilerError !== null;
  }
</script>

{#if showCompilerError}
  <Alert bind:showAlert={showCompilerError}>
    <h1>Unexpected compilation error:</h1>
    {#if $compilerError}
      <pre>{$compilerError.toString()}</pre>
    {/if}
  </Alert>
{/if}

<style lang="scss">
  pre {
    white-space: pre-wrap;
    word-wrap: break-word;
  }
</style>
