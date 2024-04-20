<script lang="ts">
  import Alert from "./Alert.svelte";

  export let showAbout: boolean;
</script>

<Alert bind:showAlert={showAbout} alignTop={false}>
  <h1>What is NAND?</h1>
  <p>
    <b>N</b> ot
    <br /><b>A</b>
    <br /><b>N</b> and-powered
    <br /><b>D</b> evice
  </p>

  <p>
    is a turing equivalent 16-bit computer entirely built from a clock and NAND
    logic gates. NAND features its own machine code language, assembly language,
    assembler, virtual machine language, virtual machine translator, programming
    language, compiler, and IDE. NAND is based on the Jack-VM-Hack platform
    specified in the <a href="https://www.nand2tetris.org/"
      >Nand to Tetris course</a
    >.
  </p>

  <h1>How do I use NAND?</h1>

  <p>
    NAND can only be programmed in Jack, its weakly typed object-oriented
    programming language. You should use either my example code and my <a
      href="https://github.com/ArhanChaudhary/NAND?tab=readme-ov-file#writing-programs-for-nand"
      >Jack language tutorial</a
    >
    as a reference for writing in Jack.
  </p>

  <p>
    To run a NAND program, load an example program or write your own and then
    click "Start".
  </p>
</Alert>
