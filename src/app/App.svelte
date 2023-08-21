<script lang="ts">
  import Computer from './Computer.svelte';
</script>

<!-- no scss because it complains about unused css in normalize.css -->
<style>
  @import 'normalize.css';
  main {
    background-color: tan;
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100dvh;
  }
</style>

<main>
  <Computer />
</main>
