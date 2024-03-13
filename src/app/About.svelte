<script lang="ts">
  export let showAbout: boolean;
</script>

<div id="overlay">
  <div id="about">
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
      NAND can only be programmed in its custom programming language, named
      Jack. You can use either my example code or the <a
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

    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <!-- svelte-ignore a11y-no-static-element-interactions -->
    <div id="exit" on:click={() => (showAbout = false)}>✖</div>
  </div>
</div>

<style lang="scss">
  #overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 100;

    #about {
      position: relative;
      width: min(calc(100% - 40px), 700px);
      padding: 15px;
      background-color: hsl(220, 10%, 5%);
      border-radius: 15px;
      border: 5px solid hsl(0, 0%, 70%);
      box-shadow: 0 0 30px 5px black;

      :not(h1) {
        font-size: 15px;
      }

      :first-child {
        margin-top: 10px;
      }

      #exit {
        position: absolute;
        aspect-ratio: 1;
        top: 10px;
        right: 20px;
        font-size: 50px;
        cursor: pointer;
      }
    }
  }
</style>
