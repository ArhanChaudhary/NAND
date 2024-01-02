<script>
  import CodeEditor from "./CodeEditor.svelte";
</script>

<div id="ide">
  <CodeEditor />
</div>

<style lang="scss">
  #ide {
    min-width: 0;
    flex-grow: 1;
    height: 100%;
  }
</style>
