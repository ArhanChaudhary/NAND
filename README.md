<p align="center">
    <img src="media/logo.png" width="200">
</p>
<hr>
<!-- cSpell:disable -->

<b>N</b> ot\
<b>A</b> \
<b>N</b> and-powered\
<b>D</b> evice
<!-- cSpell:enable -->
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
    - [Hardware Specification](#hardware-specification)
- [Jack Reference](#jack-reference)
    - [Program structure](#program-structure)
    - [Syntax](#syntax)
    - [Variables](#variables)
    - [Statements](#statements)
- [Jack OS Reference](#jack-os-reference)
    - [Array](#array)
    - [Keyboard](#keyboard)
    - [Math](#math)
    - [Memory](#memory)
    - [Output](#output)
    - [Screen](#screen)
    - [String](#string)
    - [Sys](#sys)
    - [Error Codes](#error-codes)
- [How does NAND work?](#how-does-nand-work)
- [FAQ](#faq)
    - [Whoa, is *everything* made from NAND gates?](#whoa-is-everything-made-from-nand-gates)
    - [Did you design NAND by yourself?](#did-you-design-nand-by-yourself)
    - [If there's only one type, what is the point of specifying types at all?](#if-theres-only-one-type-what-is-the-point-of-specifying-types-at-all)
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

**Before we start, the most important detail to remember about writing programs in Jack is that there is no operator priority; this is probably why your program isn't working.**

For example, you should change: \
`4 * 2 + 3` to `(4 * 2) + 3` \
`if (~x & y)` to `if ((~x) & y)`

but you can keep `if (y & ~x)` the same as there is no operator ambiguity.

Without parenthesis, the evaluation value of an ambiguous expression is **undefined behavior**.

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

If you've already had some experience with programming, this should look very familiar; it is clear that Jack was heavily inspired by Java. `Main.main` is the entry point to the program. The function demonstrates basic usage of variables as well as the while loop for control flow. Additionally, it uses `Keyboard.readLine` and `Keyboard.readInt` to read input from the user, and `Output.printString` and `Output.println` to render output to the screen, all of which are defined in detail in the [Jack OS Reference](#jack-os).

Every programming language has a fixed set of primitive data types. Jack supports three: `int`, `char`, and `boolean`. You can represent your own abstract data type by creating new classes as needed.
// point stuff, mention deallocating memory, no concept of private variables

Remember how we said Jack was similar to Java? That was a facade, or at best misleading. While Java is strongly-typed and as such supports complex type features such as down casting, polymorphism, and inheritance, Jack supports none of these and only has one type under the hood: the signed 16-bit integer. This is the primary reason why Jack is so weakly-typed. In effect, the compiler won't care if you mix and match different types in assignments and operations:

```js
var char c;
var String s;
let c = 65; // ‘A’
// Equivalently
let s = “A”;
let c = s.charAt(0);
```

```js
var Array a;
let a = 5000;
let a[100] = 77; // RAM[5100] = 77
```

```js
var Complex c;
var Array a;
let a = Array.new(2);
let a[0] = 7;
let a[1] = 8;
let c = a; // c == Complex(7, 8)
           // Works because it matches the memory layout
           // of the Complex type
```

Don't take this the wrong way — Jack still provides a powerful and functional object-oriented model if used properly. This knowledge intends to help you understand when you should perform type conversions (memory layout should be the same)

```js
class Foo {
    ...
    method void f() {
        var Bar b; // Declares a local variable of class type Bar
        var int i; // Declares a local variable of primitive type int

        do g(); // Calls method g of the current class on the this object
                // Note: Cannot be called from within a function (static method)

        do Foo.p(3); // Calls function p of the current class;
                     // Note: A function call must be preceded by the class name

        do Bar.h();      // Calls function h of class Bar
        let b = Bar.r(); // Calls function or constructor r of class Bar
        do b.q();        // Calls method q of class Bar on the b object
    }
}
```

You now know how to program NAND in Jack! Press "Start" to compile and run your code. The OS will typically take a little under second to initialize memory and set up its services before you'll see your program running!

### Undefined Behavior

### Hardware Specification

<br>

# Jack Reference

This majority of this section was directly taken from the <a href="https://drive.google.com/file/d/1CAGF8d3pDIOgqX8NZGzU34PPEzvfTYrk/view">Nand to Tetris lecture slides</a> and the <a href="https://www.csie.ntu.edu.tw/~cyy/courses/introCS/18fall/lectures/handouts/lec13_Jack.pdf">National Taiwan University lecture slides</a>.

### Program structure

<pre>
<b>class</b> ClassName {
    <b>field</b> <i>variable declarations</i>;
    <b>static</b> <i>variable declarations</i>;

    <b>constructor</b> <i>type</i> ( <i>parameterList</i> ) {
        <i>local variable declarations</i>;
        <i>statements</i>
    }

    <b>method</b> <i>type</i> ( <i>parameterList</i> ) {
        <i>local variable declarations</i>;
        <i>statements</i>
    }

    <b>function</b> <i>type</i> ( <i>parameterList</i> ) {
        <i>local variable declarations</i>;
        <i>statements</i>
    }
}
</pre>

About this spec:
- Every part in this spec can appear 0 or more times
- The order of the field / static
declarations is arbitrary
- The order of the subroutine declarations is arbitrary
- Each type is either `int`, `boolean`, `char`, or a class name

A Jack program:
- Defines classes in separate files
- Consists of a collection of one or more classes, one of which must be named `Main`
- Must define the `main` function in the `Main` class, the entry point of the program

### Syntax

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
              <th align="left">
                <code>(</code>&nbsp;<code>)</code>
              </th>
              <td>
                Used for grouping arithmetic expressions and for enclosing parameter-lists and argument-lists
              </td>
            </tr>
            <tr>
              <th align="left">
                <code>[</code>&nbsp;<code>]</code>
              </th>
              <td>
                Used for array indexing
              </td>
            </tr>
            <tr>
              <th align="left">
                <code>{</code>&nbsp;<code>}</code>
              </th>
              <td>
                Used for grouping program units and statements
              </td>
            </tr>
            <tr>
              <th align="left">
                <code>,</code>
              </th>
              <td>
                Variable list separator
              </td>
            </tr>
            <tr>
              <th align="left">
                <code>;</code>
              </th>
              <td>
                Statement terminator
              </td>
            </tr>
            <tr>
              <th align="left">
                <code>.</code>
              </th>
              <td>
                Class membership
              </td>
            </tr>
            <tr>
              <th align="left">
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
                Operators. Note that <code>&</code> and <code>|</code> do not short-circuit
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
              <th align="left">
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
              <th align="left">
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
              <th align="left">
                <code>var</code>,
                <code>static</code>,
                <code>field</code>
              </th>
              <td>
                Variable declarations
              </td>
            </tr>
            <tr>
              <th align="left">
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
              <th align="left">
                <code>true</code>,
                <code>false</code>,
                <code>null</code>
              </th>
              <td>
                Constant values (-1. 0, and 0 respectively)
              </td>
            </tr>
            <tr>
              <th align="left">
                <code>this</code>
              </th>
              <td>
                Object reference
              </td>
            </tr>
            <tr>
              <th align="left">
                <code>arguments</code>
              </th>
              <td>
                Subroutine arguments array reference
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
          <i>String</i> constants are enclosed within quotation marks and may contain any characters except new lines or quotation marks. Unlike typical programming languages, these characters cannot be escaped within a string, so these characters are instead supplied by the functions <code>String.newLine()</code> and <code>String.doubleQuote()</code> from the OS<br>
          <br>
          <i>Boolean</i> constants can be true or false.<br>
          <br>
          The constant null signifies a null reference (a value of 0).
      </td>
    </tr>
  <tr>
    <th>Identifiers</th>
    <td>
        Identifiers are composed from arbitrarily long sequences of letters
        (<code>A-Z</code>, <code>a-z</code>), digits (<code>0-9</code>), and "_". The first character must be a letter or "_".<br>
        <br>
        Case sensitivity matters. Thus <code>x</code> and <code>X</code> are treated as different identifiers.
    </td>
  </tr>
  </tbody>
</table>

### Variables

| Variable kind       | Description                                                                                                                                                                                          | Declared in            | Scope                                                                                 |
| ------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------- | ------------------------------------------------------------------------------------- |
| static variables    | `static` *type varName1, varName2, ...*;<br>Only one copy of each static variable exists, and this copy is shared by all the object instances of the class (like *private static variables* in Java) | class declaration      | The class in which they are declared.                                                 |
| field variables     | `field` *type varName1, varName2, ...*;<br>Every object (instance of the class) has a private copy of the field variables (like *member variables* in Java)                                          | class declaration      | The class in which they are declared, except for functions, where they are undefined. |
| local variables     | `var` *type varName1, varName2, ...*;<br>Local variables are created just before the subroutine starts running and are disposed when it returns (like *local variables* in Java)                     | subroutine declaration | The subroutine in which they are declared.                                            |
| parameter variables | *type varName1, varName2, ...*<br>Used to pass arguments to the subroutine. Treated like local variables whose values are initialized "from the outside", just before the subroutine starts running. | subroutine signature   | The subroutine in which they are declared.                                            |

### Statements

| Statement | Syntax                                                                                                                  | Description                                                                                                                                                                |
| --------- | ----------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| let       | `let` *varName = expression*;<br>or<br>`let` *varName*[*expression1*] = *expression2*;                                  | An assignment operation (where *varName* is either single-valued or an array). The variable kind may be *static, local, field, or parameter*.                              |
| if        | `if` (expression) {<br>&nbsp;&nbsp;&nbsp;&nbsp;statements1<br>}<br>`else` {<br>&nbsp;&nbsp;&nbsp;&nbsp;statements2<br>} | Typical if statement with an optional else clause.<br><br> The curly brackets are mandatory even if *statements* is a single statement.                                    |
| while     | `while` (expression) {<br>&nbsp;&nbsp;&nbsp;&nbsp;*statements*<br>}                                                     | Typical *while* statement.<br><br>The curly brackets are mandatory even if statements is a single statement.                                                               |
| do        | `do` *function-or-method-call*;                                                                                         | Used to call a function or a method for its effect, ignoring the returned value.                                                                                           |
| return    | `return` expression;<br>or<br>`return`;                                                                                 | Used to return a value from a subroutine.<br>The second form must be used by functions and methods that return a void value. Constructors must return the expression this. |

# Jack OS Reference

This majority of this section was directly taken from the <a href="https://drive.google.com/file/d/1CAGF8d3pDIOgqX8NZGzU34PPEzvfTYrk/view">Nand to Tetris lecture slides</a> and the <a href="https://drive.google.com/file/d/137PiYjt4CAZ3ROWiD0DJ8XMUbMM0_VHR/view">Nand to Tetris lecture slides</a>.

### Array

### Keyboard

### Main

### Math

### Memory

### Output

### Screen

### String

### Sys

### Error Codes

If you do something that forces the computer into an invalid state, like computing the result of 1 / 0, the Jack OS will display one of these error codes in the format of "ERR[N]" and immediately terminate the program:

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

The NAND computer follows the <a href="https://en.wikipedia.org/wiki/Harvard_architecture">Harvard architecture</a>. That is, the instruction memory and the data memory are separately stored, brought function in unison by the CPU.

<img src="media/cpu.png" width="700">

NAND's CPU is an <a href="https://en.wikipedia.org/wiki/Accumulator_(computing)#Accumulator_machines">accumulator machine</a>, meaning that it is heavily dependent on its built-in registers for control flow (in this case the accumulator is the D register). Don't worry if you don't fully understand what the CPU visualization depicts. Instead, take the perspective of appreciation for how this elegantly simple design powers the entirety of NAND — in your web browser!

<img src="media/alu.png" width="700">

We've reached the instruction set, the nitty-gritty. As indicated, NAND's CPU only has *two* opcodes! This makes the instruction set relatively simple while providing a rich functionality. NAND's ALU is also specified with which expressions it can compute in a single instruction.

Phew! That was a lot to take in, but I promise you NAND is far less complicated than it's made out to be. From a relatively simple logical foundation, turing equivalence is achieved! If you want see my implementation of the NAND computer architecture, <a href="src/core">you're more than welcome to</a>! If you find yourself still curious, check out the <a href="https://drive.google.com/file/d/1Z_fxYmmRNXTkAzmZ6YMoX9NXZIRVCKiw/view">Nand to Tetris lecture slides</a> for further elaboration on every aspect of its design.

Let's just briefly talk about the compiler to make this section feel complete. Some of NAND's strange syntactical features are a direct consequence of making the compiler easier to implement. The compiler is a <a href="https://en.wikipedia.org/wiki/LL_parser">recursive LL(1) parser</a>, generating VM code in <a href="https://en.wikipedia.org/wiki/Reverse_Polish_notation">postfix notation</a> to be utilized as a <a href="https://en.wikipedia.org/wiki/Stack_machine">simple stack machine</a>. Once again, you're more than welcome to see my <a href="src/compiler">compiler implementation</a> for yourself.

# FAQ

### Whoa, is *everything* made from NAND gates?

Well..., I admit the description and title are a little misleading, but still in good faith. The compiler and VM translator are written in Typescript, and the kernel and hardware are emulated in Rust. It's only really the logic simulator that runs every computation, screen rendering operation, and memory access entirely from NAND gates. Bootstrapping the full tech stack is a feat that isn't unheard of, but such a massive project by itself probably deserves its own repository.

### Did you design NAND by yourself?

NAND is entirely based off of the [Nand to Tetris course](https://www.nand2tetris.org) and its [associated book](https://www.amazon.com/Elements-Computing-Systems-second-Principles-dp-0262539802/dp/0262539802/ref=dp_ob_title_bk) (and you should definitely check it out, it's an absolutely incredible read). I solely implemented the specification for CPU, assembler, VM translator, and compiler, while porting the platform to the web with its own IDE and user interface. Each VM instruction is then trivially mapped to corresponding machine code.

### If there's only one type, what is the point of specifying types at all?

This question references the fact that under the hood, the signed 16-bit integer is Jack's only type. We anyways need to be so explicit with types to help the compiler figure out which class instance methods belong to. For instance, if we declare `s` with the type `String`, `s.appendChar(33)` is transformed into `String.appendChar(s, 33)`.

### Why does the IDE feel finnicky?

NAND's IDE unfortunately trades implementation simplicity for a worse user experience. It uses the unorthodox <a href="https://medium.engineering/why-contenteditable-is-terrible-122d8a40e480">contenteditable</a> and hacky cursor positioning logic to get syntax highlighting to work. I myself was surprised that I managed to even bring it to a functional state. As a result, it's slow and noticeably buggy, plus common keybinds don't work. I'm sorry, but for now you'll just need to bear with me.
