<script lang="ts">
  import Alert from "./Alert.svelte";

  export let showAbout: boolean;
</script>

<Alert bind:showAlert={showAbout}>
  <h1>What is NAND?</h1>
  <p>
    <b>N</b> ot
    <br /><b>A</b>
    <br /><b>N</b> and-powered
    <br /><b>D</b> evice
  </p>

  <p>
    is a turing equivalent computer entirely built from a clock and NAND logic
    gates. NAND features its own machine code language, assembly language,
    assembler, VM language, VM translator, programming language, compiler, and
    IDE. NAND is based on the Jack-VM-Hack platform specified in the <a
      href="https://www.nand2tetris.org/">Nand to Tetris course</a
    >.
  </p>

  <h1>How do I use NAND?</h1>

  <p>
    NAND can only be programmed in its custom programming language, named Jack.
    You can use either my example code or the <a
      href="https://drive.google.com/file/d/1CAGF8d3pDIOgqX8NZGzU34PPEzvfTYrk/view"
      >Jack language specification</a
    >
    as a reference for writing in Jack. You may also find useful the
    <a
      href="https://drive.google.com/file/d/137PiYjt4CAZ3ROWiD0DJ8XMUbMM0_VHR/view"
      >Jack OS specification</a
    > to interact with the hardware and use standard library functions.
  </p>

  <p>
    To run a NAND program, load an example program or write your own and then
    click "Start".
  </p>
</Alert>

<style lang="scss">
  :not(h1) {
    font-size: 15px;
  }

  :first-child {
    margin-top: 10px;
  }
</style>
