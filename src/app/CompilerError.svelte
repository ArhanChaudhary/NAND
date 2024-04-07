<script lang="ts">
  import Alert from "./Alert.svelte";

  export let showCompilerError: boolean;
  export let compilerError: string;
</script>

<Alert bind:showAlert={showCompilerError}>
  <h1>Unexpected compilation error:</h1>
  <pre>{compilerError}</pre>
</Alert>

<style lang="scss">
  :not(h1) {
    font-size: 15px;
  }

  :first-child {
    margin-top: 10px;
  }
</style>
