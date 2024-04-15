<p align="center">
    <img src="media/logo.png" width="200">
</p>
<hr>

<b>N</b> ot\
<b>A</b> \
<b>N</b> and-powered\
<b>D</b> evice\
\
is a turing equivalent computer made entirely from a [clock](https://en.wikipedia.org/wiki/Clock_rate) and [NAND gates](https://en.wikipedia.org/wiki/NAND_gate). NAND features its own machine code language, assembly language, assembler, VM language, VM translator, programming language, compiler, and IDE. NAND is based on the Jack-VM-Hack platform specified in the [Nand to Tetris course](https://www.nand2tetris.org).

[Video demo of NAND](https://github.com/ArhanChaudhary/NAND/assets/57512390/7bedf191-d42c-4553-920f-01a539161bd3)

### Table of Contents

- [Example programs](#example-programs)
    - [Average](#average)
    - [Square](#square)
    - [Pong](#pong)
    - [Overflow](#overflow)
    - [2048](#2048)
    - [GeneticAlgorithm](#geneticalgorithm)
- [Writing programs for NAND](#writing-programs-for-nand)
    - [Jack Tutorial](#jack-tutorial)
    - [Spec Addendums](#spec-addendums)
    - [Undefined Behavior](#undefined-behavior)
- [FAQ](#faq)
    - [Whoa, is *everything* made from NAND gates?](#whoa-is-everything-made-from-nand-gates)
    - [Did you design NAND entirely by yourself?](#did-you-design-nand-entirely-by-yourself)
    - [How does NAND work?](#how-does-nand-work)
    - [Why does the IDE feel finnicky?](#why-does-the-ide-feel-finnicky)
    - [I've just ran a program and I see "ERR\[X\]". What does that mean?](#ive-just-ran-a-program-and-i-see-errx-what-does-that-mean)

<hr>

# Example programs

### Average

### Square

### Pong

### Overflow

### 2048

### GeneticAlgorithm

<hr>

# Writing programs for NAND

### Jack Tutorial

### Spec Addendums

### Undefined Behavior

<hr>

# FAQ

### Whoa, is *everything* made from NAND gates?

Wellll..., I admit the description and title are a little misleading, but still in good faith. The compiler and VM translator are written in Typescript, and the kernal and hardware are emulated in Rust. It's only really the logic simulator that runs every computation, screen rendering operation, and memory access entirely from NAND gates. Bootstrapping the entire tech stack is a feat that isn't unheard of, but such a massive project by itself probably deserves its own repository.

### Did you design NAND entirely by yourself?

NAND is entirely based off of the [Nand to Tetris course](https://www.nand2tetris.org) and its [associated book](https://www.amazon.com/Elements-Computing-Systems-second-Principles-dp-0262539802/dp/0262539802/ref=dp_ob_title_bk) (and you should definitely check it out, it's an absolutely incredible read). I just implemented the specification for CPU, assembler, VM translator, and compiler, while porting the platform to the web with its own IDE and user interface.

### How does NAND work?

I'm glad you asked! I've found the following illustrations quite illuminating:

<img src="media/computer.png" width="500">

The NAND computer follows the <a href="https://en.wikipedia.org/wiki/Harvard_architecture">Harvard architecture</a>. That is, the instruction memory and the data memory are separately stored, and brought together to function in unison by the CPU.

<img src="media/cpu.png" width="500">

NAND's CPU is an <a href="https://en.wikipedia.org/wiki/Accumulator_(computing)#Accumulator_machines">accumulator machine</a>, meaning that it is heavily dependent on its built-in registers for control flow (in this case the accumulator is the D register). Don't worry if you don't fully understand what the CPU visualization depicts. Instead, take the perspective of appreciation for how this elegantly simple design powers the entirety of NAND — in your web browser!

<img src="media/alu.png" width="500">

We've reached the nitty-gritty: the instruction set. As indicated, NAND's CPU only has *two* opcodes! This makes the instruction set relatively simple while providing a rich functionality. NAND's ALU is also specified with which expressions it can compute in a single instruction.

Phew! That was a lot to take in, but I promise you NAND is far less complicated than it's made out to be. From a relatively simple logical foundation, turing equivalence is achieved! If you want see my implementation of the NAND computer architecture, <a href="src/core">you're more than welcome to</a>! If you find yourself still curious, check out the official <a href="https://drive.google.com/file/d/1Z_fxYmmRNXTkAzmZ6YMoX9NXZIRVCKiw/view">nand2tetris computer architecture lecture slides</a> for further elaboration on every aspect of its design.

### Why does the IDE feel finnicky?

NAND's IDE unfortunately trades implementation simplicity for a worse user experience. It uses the unorthodox <a href="https://medium.engineering/why-contenteditable-is-terrible-122d8a40e480">contenteditable</a> and hacky positioning logic to get syntax highlighting to work. I myself was surprised that I managed to even bring it to a funtional state. As a result, it's slow and noticably buggy, plus common keybinds don't work. I'm sorry, but for now you'll just need to bear with me.

### I've just ran a program and I see "ERR[X]". What does that mean?

NAND's OS has its own way of handling runtime errors. If you do something that puts the computer in an invalid state, like computing the result of 1 / 0, it will display an <a href="https://classes.engineering.wustl.edu/cse365/error_codes.php">error code</a> and immediately terminate.