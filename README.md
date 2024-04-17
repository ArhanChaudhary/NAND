<p align="center">
    <img src="media/logo.png" width="200">
</p>
<hr>

<b>N</b> ot\
<b>A</b> \
<b>N</b> and-powered\
<b>D</b> evice\
\
is a turing equivalent 16-bit computer made entirely from a [clock](https://en.wikipedia.org/wiki/Clock_rate) and [NAND gates](https://en.wikipedia.org/wiki/NAND_gate). NAND features its own machine code language, assembly language, assembler, VM language, VM translator, programming language, compiler, and IDE. NAND is based on the Jack-VM-Hack platform specified in the [Nand to Tetris course](https://www.nand2tetris.org).

[Video demo of NAND](https://github.com/ArhanChaudhary/NAND/assets/57512390/7bedf191-d42c-4553-920f-01a539161bd3)

### Table of Contents

- [Example programs](#example-programs)
    - [Average](#average)
    - [Pong](#pong)
    - [Overflow](#overflow)
    - [SecretPassword](#secretpassword)
    - [2048](#2048)
    - [GeneticAlgorithm](#geneticalgorithm)
- [Writing programs for NAND](#writing-programs-for-nand)
    - [Jack Tutorial](#jack-tutorial)
    - [Undefined Behavior](#undefined-behavior)
    - [Hardware Limitations](#hardware-limitations)
- [Jack Reference](#jack-reference)
    - [Syntactic elements](#syntactic-elements)
- [How does NAND work?](#how-does-nand-work)
- [FAQ](#faq)
    - [Whoa, is *everything* made from NAND gates?](#whoa-is-everything-made-from-nand-gates)
    - [Did you design NAND by yourself?](#did-you-design-nand-by-yourself)
    - [Why does the IDE feel finnicky?](#why-does-the-ide-feel-finnicky)

<br>

# Example programs

### Average

### Pong

### Overflow

### SecretPassword

### 2048

### GeneticAlgorithm

<br>

# Writing programs for NAND

### Jack Tutorial

NAND boasts its own complete tech stack. As a consequence, NAND can only be programmed in Jack, its custom weakly typed object-oriented programming language. In layman's terms, Jack is C with Java's syntax and without types.

The rest of this section has been adapted from the <a href="https://drive.google.com/file/d/1CAGF8d3pDIOgqX8NZGzU34PPEzvfTYrk/view">Nand to Tetris lecture slides</a>. Let's take the approach of example-based learning and dive right in.

```js
/**
 * This program prompts the user to enter a phrase
 * and an energy level. Program output:
 *
 * Whats on your mind? Superman
 * Whats your energy level? 3
 * Superman!
 * Superman!
 * Superman!
 */
class Main {
    function void main() {
        var String s;
        var int energy, i;
        let s = Keyboard.readLine("Whats on your mind? ");
        let energy = Keyboard.readInt("Whats your energy level? ");
        // Not actually needed because variables are initialized to 0
        let i = 0;
        let s = s.appendChar(33); // Appends the character '!'
        while (i < energy) {
            do Output.printString(s);
            do Output.println();
            let i = i + 1;
        }
    }
}
```

If you've already had some experience with programming, this should look very familiar. It is clear that Jack was heavily inspired by Java, but as we'll get to later on, only at a surface level.

Jack programs aren't meant to be ran by themselves. Every program is packaged with the operating system, providing the interfaces for `Array`, `Keyboard`, `Math`, `Memory`, `Output`, `Screen`, `String`, and `Sys`, each of which are defined in detail in the [Jack Reference](#jack-reference).

Remember how we compared Jack to Java? That was a fascade, or at best misleading. While Java is strongly-typed and as such supports complex type features such as downcasting, polymorphism, and inerheritance, Jack supports none of these and only has one type under the hood: the signed 16-bit integer. This means the NAND compiler and runtime will allow you to mix and match different types in assignments and operations.

Here's a fun fact. The only reason we explicitly specify types at all is so the compiler can figure out which class instance methods belong to. For instance, `s.appendChar(33)` is transformed into `String.appendChar(s, 33)` because we declared `s` with the type `String`. But don't take this detail the wrong way



Every programming language has a fixed set of primitive data types, of which Jack supports three: `int`, `char`, and `boolean`. You can represent your own data type by creating new classes as needed.


### Undefined Behavior

### Hardware Limitations

<br>

# Jack Reference

This section was directly taken from the <a href="https://drive.google.com/file/d/1CAGF8d3pDIOgqX8NZGzU34PPEzvfTYrk/view">Nand to Tetris lecture slides</a> and the <a href="https://www.csie.ntu.edu.tw/~cyy/courses/introCS/18fall/lectures/handouts/lec13_Jack.pdf">National Taiwan University lecture slides</a>.

### Syntactic elements

<table>
  <tbody>
    <tr>
      <th>White space and comments</th>
      <td>
        Space characters, newline characters, and comments are ignored.<br>
        <br>
        The following comment formats are supported:<br>
        <code>// Comment to end of line</code><br>
        <code>/* Comment until closing */</code><br>
        <code>/** API documentation comment */</code>
      </td>
    </tr>
    <tr>
      <th>Symbols</th>
      <td>
        <table>
          <tbody>
            <tr>
              <th>
                <code>(</code>&nbsp;<code>)</code>
              </th>
              <td>
                Used for grouping arithmetic expressions and for enclosing parameter-lists and argument-lists
              </td>
            </tr>
            <tr>
              <th>
                <code>[</code>&nbsp;<code>]</code>
              </th>
              <td>
                Used for array indexing
              </td>
            </tr>
            <tr>
              <th>
                <code>{</code>&nbsp;<code>}</code>
              </th>
              <td>
                Used for grouping program units and statements
              </td>
            </tr>
            <tr>
              <th>
                <code>,</code>
              </th>
              <td>
                Variable list separator
              </td>
            </tr>
            <tr>
              <th>
                <code>;</code>
              </th>
              <td>
                Statement terminator
              </td>
            </tr>
            <tr>
              <th>
                <code>.</code>
              </th>
              <td>
                Class membership
              </td>
            </tr>
            <tr>
              <th>
                <code>=</code>
              </th>
              <td>
                Assignment and comparison operator
              </td>
            </tr>
            <tr>
              <th>
                <code>+</code>&nbsp;<code>-</code>&nbsp;<code>*</code><br>
                <code>/</code>&nbsp;<code>&</code>&nbsp;<code>|</code><br>
                <code>-</code>&nbsp;<code><</code>&nbsp;<code>></code>
              </th>
              <td>
                Operators
              </td>
            </tr>
          </tbody>
        </table>
      </td>
    </tr>
    <tr>
      <th>Reserved words</th>
      <td>
        <table>
          <tbody>
            <tr>
              <th>
                <code>class</code>,
                <code>constructor</code>,
                <code>method</code>,
                <code>function</code>
              </th>
              <td>
                Program components
              </td>
            </tr>
            <tr>
              <th>
                <code>int</code>,
                <code>boolean</code>,
                <code>char</code>,
                <code>void</code>
              </th>
              <td>
                Primitive types
              </td>
            </tr>
            <tr>
              <th>
                <code>var</code>,
                <code>static</code>,
                <code>field</code>
              </th>
              <td>
                Variable declarations
              </td>
            </tr>
            <tr>
              <th>
                <code>let</code>,
                <code>do</code>,
                <code>if</code>,
                <code>else</code>,
                <code>while</code>,
                <code>return</code>
              </th>
              <td>
                Statements
              </td>
            </tr>
            <tr>
              <th>
                <code>true</code>,
                <code>false</code>,
                <code>null</code>
              </th>
              <td>
                Constant values
              </td>
            </tr>
            <tr>
              <th>
                <code>this</code>
              </th>
              <td>
                Object reference
              </td>
            </tr>
          </tbody>
        </table>
      </td>
    </tr>
    <tr>
      <th>Constants</th>
      <td>
          <i>Integer</i> constants must be positive and in standard decimal notation, e.g., <code>1984</code>. Negative integers like <code>-13</code> are not constants but rather expressions consisting of a unary minus operator applied to an integer constant.<br>
          <br>
          <i>String</i> constants are enclosed within two quote (") characters and may contain any characters except newline or double-quote. (These characters are supplied by the functions <code>String.newLine()</code> and <code>String.doubleQuote()</code> from the standard library.)<br>
          <br>
          <i>Boolean</i> constants can be true or false.<br>
          <br>
          The constant null signifies a null reference.
      </td>
    </tr>
  <tr>
    <th>Identifiers</th>
    <td>
        Identifiers are composed from arbitrarily long sequences of letters
        (<code>A-Z</code>, <code>a-z</code>), digits (<code>0-9</code>), and "_". The first character must be a letter or "_".<br>
        <br>
        The language is case sensitive. Thus <code>x</code> and <code>X</code> are treated as different identifiers.
    </td>
  </tr>
  </tbody>
</table>

If you do something that puts the computer in an invalid state, like computing the result of 1 / 0, NAND's OS will display one of these error codes and immediately terminate:

| Code | Method/Function      | Description                                     |
| ---- | -------------------- | ----------------------------------------------- |
| 1    | Sys.wait             | Duration must be positive                       |
| 2    | Array.new            | Array size must be positive                     |
| 3    | Math.divide          | Division by zero                                |
| 4    | Math.sqrt            | Cannot compute square root of a negative number |
| 5    | Memory.alloc         | Allocated memory size must be positive          |
| 6    | Memory.alloc         | Heap overflow                                   |
| 7    | Screen.drawPixel     | Illegal pixel coordinates                       |
| 8    | Screen.drawLine      | Illegal line coordinates                        |
| 9    | Screen.drawRectangle | Illegal rectangle coordinates                   |
| 12   | Screen.drawCircle    | Illegal center coordinates                      |
| 13   | Screen.drawCircle    | Illegal radius                                  |
| 14   | String.new           | Maximum length must be non-negative             |
| 15   | String.charAt        | String index out of bounds                      |
| 16   | String.setCharAt     | String index out of bounds                      |
| 17   | String.appendChar    | String is full                                  |
| 19   | String.setInt        | Insufficient string capacity                    |
| 20   | Output.moveCursor    | Illegal cursor location                         |

# How does NAND work?

I'm glad you asked! I've found the following illustrations quite illuminating:

<img src="media/computer.png" width="700">

The NAND computer follows the <a href="https://en.wikipedia.org/wiki/Harvard_architecture">Harvard architecture</a>. That is, the instruction memory and the data memory are separately stored, and brought together to function in unison by the CPU.

<img src="media/cpu.png" width="700">

NAND's CPU is an <a href="https://en.wikipedia.org/wiki/Accumulator_(computing)#Accumulator_machines">accumulator machine</a>, meaning that it is heavily dependent on its built-in registers for control flow (in this case the accumulator is the D register). Don't worry if you don't fully understand what the CPU visualization depicts. Instead, take the perspective of appreciation for how this elegantly simple design powers the entirety of NAND — in your web browser!

<img src="media/alu.png" width="700">

We've reached the nitty-gritty: the instruction set. As indicated, NAND's CPU only has *two* opcodes! This makes the instruction set relatively simple while providing a rich functionality. NAND's ALU is also specified with which expressions it can compute in a single instruction.

Phew! That was a lot to take in, but I promise you NAND is far less complicated than it's made out to be. From a relatively simple logical foundation, turing equivalence is achieved! If you want see my implementation of the NAND computer architecture, <a href="src/core">you're more than welcome to</a>! If you find yourself still curious, check out the <a href="https://drive.google.com/file/d/1Z_fxYmmRNXTkAzmZ6YMoX9NXZIRVCKiw/view">Nand to Tetris lecture slides</a> for further elaboration on every aspect of its design.

Let's just briefly talk about the compiler to make this section feel complete. Some of NAND's strange syntactical features are a direct consequence of making the compiler easier to implement. The compiler is a <a href="https://en.wikipedia.org/wiki/LL_parser">recursive LL(1) parser</a>, generating VM code in <a href="https://en.wikipedia.org/wiki/Reverse_Polish_notation">postfix notation</a> to be utilized as a <a href="https://en.wikipedia.org/wiki/Stack_machine">simple stack machine</a>.

# FAQ

### Whoa, is *everything* made from NAND gates?

Wellll..., I admit the description and title are a little misleading, but still in good faith. The compiler and VM translator are written in Typescript, and the kernal and hardware are emulated in Rust. It's only really the logic simulator that runs every computation, screen rendering operation, and memory access entirely from NAND gates. Bootstrapping the full tech stack is a feat that isn't unheard of, but such a massive project by itself probably deserves its own repository.

### Did you design NAND by yourself?

NAND is entirely based off of the [Nand to Tetris course](https://www.nand2tetris.org) and its [associated book](https://www.amazon.com/Elements-Computing-Systems-second-Principles-dp-0262539802/dp/0262539802/ref=dp_ob_title_bk) (and you should definitely check it out, it's an absolutely incredible read). I solely implemented the specification for CPU, assembler, VM translator, and compiler, while porting the platform to the web with its own IDE and user interface. Each VM instruction is then trivially mapped to corresponding machine code.

### Why does the IDE feel finnicky?

NAND's IDE unfortunately trades implementation simplicity for a worse user experience. It uses the unorthodox <a href="https://medium.engineering/why-contenteditable-is-terrible-122d8a40e480">contenteditable</a> and hacky cursor positioning logic to get syntax highlighting to work. I myself was surprised that I managed to even bring it to a funtional state. As a result, it's slow and noticably buggy, plus common keybinds don't work. I'm sorry, but for now you'll just need to bear with me.
