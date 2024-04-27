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
is a Turing equivalent 16-bit computer made entirely from a [clock](https://en.wikipedia.org/wiki/Clock_rate) and [NAND gates](https://en.wikipedia.org/wiki/NAND_gate) emulated on the web. NAND features its own CPU, machine code language, assembly language, assembler, virtual machine language, virtual machine translator, programming language, compiler, IDE, and user interface. NAND is based on the Jack-VM-Hack platform specified in the [Nand to Tetris course](https://www.nand2tetris.org) and its [associated book](https://www.amazon.com/Elements-Computing-Systems-second-Principles-dp-0262539802/dp/0262539802/ref=dp_ob_title_bk).

[Video demo of NAND](https://github.com/ArhanChaudhary/NAND/assets/57512390/7bedf191-d42c-4553-920f-01a539161bd3)

### Table of Contents

- [Example programs](#example-programs)
    - [Average](#average)
    - [Pong](#pong)
    - [2048](#2048)
    - [Overflow](#overflow)
    - [SecretPassword](#secretpassword)
    - [GeneticAlgorithm](#geneticalgorithm)
- [Writing programs for NAND](#writing-programs-for-nand)
    - [Jack Introduction](#jack-introduction)
    - [Custom Data Types](#custom-data-types)
    - [Weak Type Coercions](#weak-type-coercions)
    - [Manual Memory Management](#manual-memory-management)
    - [Undefined Behavior](#undefined-behavior)
      - [Operator Priority](#operator-priority)
      - [Lesser and Greater than Operators](#lesser-and-greater-than-operators)
      - [-32768](#-32768)
      - [Calling a Function with Too Few Arguments](#calling-a-function-with-too-few-arguments)
      - [Improper Type Casting](#improper-type-casting)
      - [Stack Overflows](#stack-overflows)
      - [Modifying Stack Frames or Internal Registers](#modifying-stack-frames-or-internal-registers)
    - [Hardware Specification](#hardware-specification)
    - [Beyond the Jack OS](#beyond-the-jack-os)
- [How does NAND work?](#how-does-nand-work)
- [Jack Reference](#jack-reference)
    - [Program Structure](#program-structure)
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
- [FAQ](#faq)
    - [Whoa, is *everything* made from NAND gates?](#whoa-is-everything-made-from-nand-gates)
    - [Did you design NAND by yourself?](#did-you-design-nand-by-yourself)
    - [If there's only one type, what is the point of specifying types at all?](#if-theres-only-one-type-what-is-the-point-of-specifying-types-at-all)
    - [Why does the IDE feel finnicky?](#why-does-the-ide-feel-finnicky)

# Example programs

### Average

A simple program that inputs some numbers and computes their average, showing off control flow, arithmetic operations, I/O, and dynamic memory allocation.

Program output:
```
How many numbers? 4
Enter a number: 100
Enter a number: 42
Enter a number: 400
Enter a number: 300
The average is 210
```
*This program was supplied by the Nand to Tetris software suite.*

### Pong

The game of Pong, showing off the language's object-oriented model. Use the arrow keys to move the paddle left and right to bounce a ball. Every bounce, the paddle becomes smaller, and the game ends when the ball hits the bottom of the screen.

*This program was supplied by the Nand to Tetris software suite.*

### 2048

The game of 2048, showing off recursion and complex application logic. Use the arrow keys to move the numbers around the 4x4 grid. The same numbers combine into their sum when moved into each other. Once the 2048 tile is reached, you win the game, though you can keep playing on until you lose. You lose the game when the board is full and you can't make any more moves.

### Overflow

A program that deliberately causes a stack overflow via infinite recursion to perform a [virtual machine escape](https://en.wikipedia.org/wiki/Virtual_machine_escape). It leverages the fact that there are no runtime checks to prevent a stack overflow. No other modern platform will let you do this :-)

Upon running, the program will constantly print the stack pointer to the screen. Once this displayed value exceeds 2048, the stack will have reached the end of its intended memory space and spill onto the heap memory space, causing the print statement to malfunction in explosive fashion:

<img src="media/overflow.png" width="700">

Two things of noteworthy interest are worth pointing out.

If you reload the page and run this program on an empty RAM (a RAM full of zeroes), you will notice that the program resets itself halfway through its execution despite not pressing the "Reset" button. Why this happens is simple: the jailbroken runtime executes an instruction that sets the [program counter](https://en.wikipedia.org/wiki/Program_counter)'s value to 0, effectively telling the program to jump to the first instruction and start over.

If you run the GeneticAlgorithm example program and then run this immediately afterwards, the program in its rampage reads old RAM memory that was simply never overwritten.

<img src="media/old_memory.png" width="700">

### SecretPassword

A program that exploits the fact that the runtime doesn't prevent [stack smashing](https://en.wikipedia.org/wiki/Stack_buffer_overflow) to call a function that would otherwise be inaccessible. In order to understand how this works, let's examine this illustration of NAND's stack frame layout.

<img src="media/stack_layout.png" width="700">

*taken from the [Nand to Tetris book](https://www.amazon.com/Elements-Computing-Systems-second-Principles-dp-0262539802/dp/0262539802/ref=dp_ob_title_bk).*

If you're unfamiliar with stack layouts, here's the main idea behind the exploit. Whenever a function returns, it needs to know where (which machine code instruction memory address) it should go to proceed with execution flow. So, when the function is first called, this memory address, along with some other unimportant data, is temporarily stored on the stack in a memory region referred to as the [stack frame](https://en.wikipedia.org/wiki/Call_stack#STACK-FRAME) as a reference for where to return. The illustration describes the exact position of this return address relative to the function call, a position that can be reverse engineered.

The program enables the user to overwrite a single memory address in the RAM to any value. Putting two and two together, if the user were to overwrite the return address of a stack frame with the address of another function, they essentially gain the ability to execute arbitrary code included in the program.

Indeed, if you enter 267 as the memory location and 1715 as the value to overwrite, two numbers reverse engineered by manually inspecting the stack memory space and the assembler, you'll see this idea in working action.

<img src="media/secret_password.png" width="700">

This isn't a vulnerability unique to NAND. [It exists in C as well](https://en.wikipedia.org/wiki/Buffer_overflow)! How cool!

### GeneticAlgorithm

Believe it or not, out of the many, *many* different components of NAND, this single-handedly took the longest to develop!

This program is a creature simulation that utilizes simple machine learning. It follows the artificial intelligence coded series (parts <a href="https://www.youtube.com/watch?v=VnwjxityDLQ">one</a> and <a href="https://www.youtube.com/watch?v=BOZfhUcNiqk">two</a>) from <a href="https://www.youtube.com/@CodeBullet">Code Bullet</a>. Make sure to check out his channel, he makes some really cool stuff!

[Video demo of the Genetic Algorithm program](https://github.com/ArhanChaudhary/ArhanChaudhary/assets/57512390/c0ecf5e9-26d0-4367-a1a9-0ed2ebc4098d)

Simply explained:

Every dot has its own "brain" of acceleration vectors, and they evolve to reach a goal through natural selection. Every generation, dots that "die" closer to the goal are more likely to be selected as the parents for the next generation. Reproduction inherently causes some of the brain to mutate, wholly effectively simulating natural evolution.

Nevertheless, there is much to be desired. Due to performance, the only factor dots use to evolve is their closeness to the goal upon death, endowing the natural selection algorithm with low entropy. Due to memory usage, there are smaller than satisfactory limits on the number of dots and the sizes of their brains. Lastly, due to technical complexity, re-placing obstacles during the simulation does not guarantee that the dots will have large enough brains to reach the goal. Brain sizes are only determined at the beginning of the program.

I've utilized a myriad of optimization techniques to snake around the following hardware restrictions and make this possible:
- NAND has a limited ROM memory space, meaning the program won't compile if there's too much code. In fact, the final version of this program uses 99.2% of the instruction memory space.
- NAND has a limited RAM memory space, meaning the program has to be careful to optimize heap memory usage. In fact, the reason why the screen fills with static between generations is to use the screen memory space as temporary swap memory for the next generation — the RAM is already completely full!
- NAND has no floating point type (decimal numbers) and can only represent the integers between -32768 and 32767, making calculating fitness less precise and more challenging to implement. [Integer overflows](https://en.wikipedia.org/wiki/Integer_overflow) must also be accounted for.

To avoid beating around the bush, I've stuck to documenting these techniques and additional insights in this program's <a href="src/example-programs/GeneticAlgorithm">codebase</a> for those interested.

# Writing programs for NAND

**Before we start, the most important detail to remember about writing programs in Jack is that there is no operator priority; this is probably why your program isn't working.**

For example, you should change: \
`4 * 2 + 3` to `(4 * 2) + 3` \
`if (~x & y)` to `if ((~x) & y)`

but you can keep `if (y & ~x)` the same as there is no operator ambiguity.

Without parenthesis, the evaluation value of an ambiguous expression is **undefined**.

### Jack Introduction

NAND boasts its own complete tech stack. As a consequence, NAND can only be programmed in Jack, its weakly typed object-oriented programming language. In layman's terms, Jack is C with Java's syntax.

Let's take the approach of example-based learning and dive right in.

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
*taken from the [Nand to Tetris lecture slides](https://drive.google.com/file/d/1CAGF8d3pDIOgqX8NZGzU34PPEzvfTYrk/view).*

If you've already had some experience with programming, this should look very familiar; it is clear that Jack was heavily inspired by Java. `Main.main` is the entry point to the program. The code segment demonstrates basic usage of variables as well as the while loop for control flow.

Additionally, it uses `Keyboard.readLine` and `Keyboard.readInt` to read input from the user, and `Output.printString` and `Output.println` to print output to the screen — all of which are defined in detail in the [Jack OS Reference](#jack-os). By default, the Jack OS is bundled with your program during compilation to enable interfacing with strings, memory, hardware, and more.

### Custom Data Types

Every programming language has a fixed set of primitive data types. Jack supports three: `int`, `char`, and `boolean`. You can extend this basic repertoire with your own abstract data types as needed. Prior knowledge about [object-oriented programming](https://en.wikipedia.org/wiki/Object-oriented_programming) directly carries over to this section.
<!-- cSpell:disable -->
```js
/** Represents a point in 2D plane. */
class Point {
    // The coordinates of the current point instance:
    field int x, y;
    // The number of point objects constructed so far:
    static int pointCount;
    /** Constructs a point and initializes
        it with the given coordinates */
    constructor Point new(int ax, int ay) {
      let x = ax;
      let y = ay;
      let pointCount = pointCount + 1;
      return this;
    }
    /** Returns the x coordinate of the current point instance */
    method int getx() { return x; }
    /** Returns the y coordinate of the current point instance */
    method int gety() { return y; }
    /** Returns the number of Points constructed so far */
    function int getPointCount() {
        return pointCount;
    }
    /** Returns a point which is this
        point plus the other point */
    method Point plus(Point other) {
        return Point.new(x + other.getx(),
                         y + other.gety());
    }
    /** Returns the Euclidean distance between the
        current point instance and the other point */
    method int distance(Point other) {
        var int dx, dy;
        let dx = x - other.getx();
        let dy = y - other.gety();
        return Math.sqrt((dx * dx) + (dy * dy));
    }
    /** Prints the current point instance, as "(x, y)" */
    method void print() {
        var String tmp;
        let tmp = "(";
        do Output.printString(tmp);
        do tmp.dispose();
        do Output.printInt(x);
        let tmp = ", ";
        do Output.printString(tmp);
        do tmp.dispose();
        do Output.printInt(y);
        let tmp = ")";
        do Output.printString(tmp);
        do tmp.dispose();
    }
}
```
```js
var Point p1, p2, p3;
let p1 = Point.new(1, 2);
let p2 = Point.new(3, 4);
let p3 = p1.plus(p2);
do p3.print(); // prints (4, 6)
do Output.println();
do Output.printInt(p1.distance(p2)); // prints 5
do Output.println();
do Output.printInt(getPointCount()); // prints 3
```
*taken from the [Nand to Tetris lecture slides](https://drive.google.com/file/d/1CAGF8d3pDIOgqX8NZGzU34PPEzvfTYrk/view).*

We define a `Point` class to represent an abstract point in space. It uses `field` variables to declare per-instance attributes of the data type. It exposes public `method` functions we can use to interface with the point, giving the caller the functionality to add two points together and calculate the distance between two points.

All `field` variables are privately scoped. If you wish to get or set these variables from outside the class declaration, these variables must have corresponding `method` functions to provide this functionality.

Omitted from the code sample to stay on-topic, it is customary for data classes to define `dispose` methods for deallocation once objects are no longer needed. See [Manual Memory Management](#manual-memory-management).

If needed, here's a reference for `function` and `method` calling syntax.
<!-- cSpell:enable -->
```js
class Foo {
    ...
    method void f() {
        var Bar b; // Declares a local variable of class type Bar
        var int i; // Declares a local variable of primitive type int

        do g(); // Calls method g of the current class on the current object instance
                // Note: Cannot be called from within a function (static method)

        do Foo.p(3); // Calls function p of the current class;
                     // Note: A function call must be preceded by the class name

        do Bar.h();      // Calls function h of class Bar
        let b = Bar.r(); // Calls function or constructor r of class Bar
        do b.q();        // Calls method q of class Bar on the b object
    }
}
```

*taken from the [Nand to Tetris lecture slides](https://drive.google.com/file/d/1CAGF8d3pDIOgqX8NZGzU34PPEzvfTYrk/view).*

### Weak Type Coercions

Remember how we said Jack was similar to Java? That was a facade, or at best misleading. While Java is strongly-typed and as such supports complex type features such as down casting, polymorphism, and inheritance, Jack supports none of these and only has one type under the hood: the signed 16-bit integer. This is the primary reason why Jack is so weakly-typed. In effect, the compiler won't care if you mix and match different types in assignments and operations.

```js
var char c;
var String s;
let c = 65; // 'A'
// Equivalently
let s = "A";
let c = s.charAt(0);
```
```js
var Array a;
let a = 5000;
let a[100] = 77; // RAM[5100] = 77
```
```js
var Array arr;
var String helloWorld;
let helloWorld = "Hello World!"
let arr = Array.new(4); // Arrays are not strictly typed
let arr[0] = 12;
let arr[1] = false;
let arr[2] = Point.new(5, 6);
let arr[3] = helloWorld;
```
```js
class Complex {
    field int real;
    field int imaginary;
    ...
}
...
var Complex c;
var Array a;
let a = Array.new(2);
let a[0] = 7;
let a[1] = 8;
let c = a; // c == Complex(7, 8)
           // Works because it matches the memory layout
           // of the Complex type
```
*all code segments taken from the [Nand to Tetris lecture slides](https://drive.google.com/file/d/1CAGF8d3pDIOgqX8NZGzU34PPEzvfTYrk/view).*

Don't take this the wrong way — Jack still provides a powerful and functional object-oriented model. This insight intends to help you understand when and how you should perform type conversions as needed.

### Manual Memory Management

Let's say you're a crazy cat lover, just like me! And you wanted to write this program to show off just how much you absolutely adore cats.
```js
class Main {
    function void main() {
        while (true) {
          do Output.printString("Kittens are so adorable! ");
        }
    }
}
```
You may be startled to notice that after a few seconds, the program will crash with "ERR6", or a [heap overflow](https://en.wikipedia.org/wiki/Heap_overflow)!

Jack is a [manually memory managed](https://en.wikipedia.org/wiki/Manual_memory_management) programming language. This means you must be vigilant to properly deallocate memory that is no longer needed, or else the Jack OS will think otherwise and facilitate a [memory leak](https://en.wikipedia.org/wiki/Memory_leak). The best practice advice is to feature a `dispose` method for each class that represents an object that properly encapsulates this deallocation. Thus, when objects are no longer needed, you can call their `dispose` methods to ensure you won't eventually run out of heap memory.

If you've programmed in other manually memory managed languages, like C, this should look very familiar. One key difference is the Jack OS stores arrays and strings on the heap rather than on the stack, hinting to why the program crashes with a heap overflow.

Let's fix this program for our fellow feline fanatics.
```js
class Main {
    function void main() {
        var String s;
        while (true) {
            let s = "Kittens are so adorable! ";
            do Output.printString(s);
            do s.dispose();
        }
    }
}
```
Alternatively, you could allocate memory for the string only once.
```js
class Main {
    function void main() {
        var String s;
        let s = "Kittens are so adorable! ";
        while (true) {
            do Output.printString(s);
        }
    }
}
```
You'll notice that not only do these alternative versions print the string much faster, but this time they'll actually print forever! Hooray!

Let's quickly peek into `String.dispose` so you can better understand how to write your own `dispose` methods.

```js
method void dispose() {
    do stringArray.dispose();
    do Memory.deAlloc(this);
}
```
`Array.dispose` called by `stringArray`
```js
method void dispose() {
    do Memory.deAlloc(this);
}
```
Proper `dispose` methods must first appropriately call `dispose` on their field variables and then finish with `do Memory.deAlloc(this);` to deallocate the object instance itself.

### Undefined Behavior

With how primitive Jack and NAND are, footguns within the language are inevitable. I've compiled the following instances of undefined behavior you should be aware of, ordered from (in my opinion) most important to least important.

#### Operator Priority

I found this caveat to be so important that I've moved it towards the [beginning of this section](#writing-programs-for-nand).

#### Lesser and Greater than Operators

The Jack expressions
```js
a > b
a < b
```
are deceptively simple. They aren't always mathematically correct, and are respectively equivalent to the Java expressions
```js
((a - b) & (1 << 15)) == 0 && a != b
((a - b) & (1 << 15)) != 0
```
What's up with the nuance? The virtual machine implementation converts `a > b` to `a - b > 0`. Here's the problem: `a - b` can [overflow](https://en.wikipedia.org/wiki/Integer_overflow) :(

What does `20000 > -20000` evaluate to? The virtual machine transpiles this to `20000 - (-20000) > 0` which evaluates to `-25336 > 0`. Unfortunately, the answer is `false`.

However, `20000 > -10000` evaluates to `30000 > 0`, or `true`.

As you may have figured, if the absolute distance between `a` and `b` is more than 32767, `a > b` and `a < b` are wrong. Otherwise, you're fine.

This isn't an implementation bug, but rather an inconsistency with Nand to Tetris itself. More about it [here](http://nand2tetris-questions-and-answers-forum.52.s1.nabble.com/Project-7-gt-and-lt-behavior-not-clearly-specified-for-signed-operands-td4036926.html#google_vignette). For compatibility reasons, this behavior won't be fixed.

#### -32768

-32768 is one of its kind. It is the only number that holds the property such that -(-32768) = -32768, a singleton without a positive counterpart<sup>*</sup>. This can lead to unsoundness and logic errors.

```js
/**
 * Program output:
 * --.)*(
 */
class Main {
    function void main() {
        // Note that -32768 must instead be written as ~32767
        // because the CPU can't load a number that large
        do Output.printInt(~32767);
    }
}
```
`Output.printInt` internally expects `Math.abs` to return a positive number. This isn't the case with -32768, so the Jack OS malfunctions.

Your main concern should be handling logic errors with the negative operator. As the programmer, if you want to guarantee the negative of a negative number is positive, it is your responsibility to check for the case of -32768 and take appropriate action.

<span id="note-1">*</span> This holds true because NAND's ALU internally processes the Jack expression `-x` as  `~(x - 1)`. Let's set `x` to `-32768` and evaluate it step by step. Here are the corresponding 16-bit [two's complement](https://en.wikipedia.org/wiki/Two%27s_complement) binary representations of the computation:

`x` = `1000 0000 0000 0000` \
`x - 1` = `0111 1111 1111 1111` \
`~(x - 1)` = `1000 0000 0000 0000` = `x`

It's the same thing! What happened here? Because NAND is a 16-bit machine, -32768 is the only number such that if you subtract one from it, you get its flipped bits. In other words, -32768 satisfies `x - 1 = ~x`, simplifying the expression to `~(~x)` or just `x`.

#### Calling a Function with Too Few Arguments

This one is self-explanatory, so here's a brief demonstration.

```js
/**
 * Program output:
 * I have 818 cookies.
 */
class Main {
    function void main() {
        do Main.cookies();
    }

    function void cookies(int a) {
        do Output.printString("I have ");
        do Output.printInt(a);
        do Output.printString(" cookies.");
    }
}
```

On the other hand, calling a function with too *many* arguments is perfectly valid. You can use the `arguments` keyword to index extra function arguments. Note that there is no indicator for the argument count.

#### Improper Type Casting

You can utilize `Array` to cast a variable into any other type. Calling instance methods that don't exist on type casted variables is undefined behavior; the compiler isn't smart enough to realize when you're doing this.

```js
/**
 * Program output:
 * 4
 */
class Main {
    constructor Main new() {
        return this;
    }

    function void main() {
        var Array a;
        var Main b;
        var String c;
        let a = Array.new(1);
        let b = Main.new();
        let a[0] = b;
        let c = a[0];
        // Invalidly calling `String.length` on an instance of `Main`.
        do Output.printInt(c.length());
    }
}
```

#### Stack Overflows

See the [Overflow](#overflow) program for an in-depth example.

#### Modifying Stack Frames or Internal Registers

Modifying stack frames or the internal registers that respectively reside at memory addresses `256` to `2047` and `1` to `15` may lead to undefined behavior. This typically isn't possible without misusing `Memory.poke` or negative array indexing. See the [SecretPassword](#secretpassword) program for an in-depth example.

### Hardware Specification

Since its rise in the 1970s, there's a good reason why 16-bit computing has fallen from grace in the modern era. Compared to 32-bit or 64-bit computing, 16-bit computing offered limited processing power and memory capacity that simply weren't meeting the demands of contemporary software and applications.

NAND is no exception to this reality.

<img src="media/memory_layout.png" width="700">

*taken from the [Nand to Tetris lecture slides](https://drive.google.com/file/d/1BexrNmdqYhKPkqD_Y81qNAUeyfzl-ZtO/view).*

Compared to your 16 GiB MacBook, NAND enjoys a meager 4 KiB of RAM, a ratio of *0.00002%*! In spite of this, [it was enough to take us to the moon](https://www.metroweekly.com/2014/07/to-the-moon-and-back-on-4kb-of-memory/), so who's to say NAND can't either.

The Jack OS reserves 14,336 memory addresses of the 4 KiB for the heap, a number that is abnormally small. This is why it's so important to ensure complex Jack applications allocate and deallocate their memory efficiently. If you're overly ambitious, you might run out of heap memory and be forced to completely rewrite your data types and logic.

The hardware reserves 8,192 memory addresses of the 4 KiB for the screen. Each bit of each address linearly maps to a corresponding pixel on the provided 512x256 screen, in [LSb 0 bit numbering](https://en.wikipedia.org/wiki/Bit_numbering#LSb_0_bit_numbering).

The hardware reserves memory address 24,576 for the keyboard, at which the currently pressed key is reflected. Though, you shouldn't directly access this location to handle user input. You should use the provided [Keyboard](#keyboard) class from the Jack OS and its associated functions.

NAND's keyboard recognizes all ASCII characters, as well as the following keys.
 * new line = 128 = `String.newline()`
 * backspace = 129 = `String.backSpace()`
 * left arrow = 130
 * up arrow = 131
 * right arrow = 132
 * down arrow = 133
 * home = 134
 * end = 135
 * page up = 136
 * page down = 137
 * insert = 138
 * delete = 139
 * ESC = 140
 * F1 - F12 = 141 - 152

Lastly, the hardware reserves 240 memory addresses for static class variables and 1,792 memory addresses for the global stack. Unless you perform deep recursion, you probably won't find these limitations troublesome.

### Beyond the Jack OS

By default, the Jack OS is bundled with your program during compilation to enable interfacing with strings, memory, hardware, and more. To the extraordinarily dedicated, it is possible to provide your own OS implementation with your own hardware interfaces. The IDE treats Jack OS files the same as typical program files; they can likewise be deleted or overwritten. There are a few core functions you *must* implement for your program to compile if you choose to do so. You're free to copy my implementations of these functions as needed.

`Sys.init`: rather than `Main.main`, this is the *real* entry point of the program, hardcoded in the virtual machine implementation. For context, the provided Jack OS implementation looks like this:

```js
function void init() {
    do Memory.init();
    do Math.init();
    do Screen.init();
    do Screen.clearScreen();
    do Output.init();
    do Main.main();
    do Sys.halt();
}
```

`Memory.alloc`: A heap memory allocator internally used by class constructors to create objects. NAND inherently places emphasis on the heap for data storage, so this function is useful in many other contexts too.

`String.newWithStr`: An internal constructor for string literals.

`Math.multiply`: This function is internally called in lieu of the multiplication operator `*`. In other words, the Jack expression `x * y` and `Math.multiply(x, y)` are equivalent.

`Math.divide`: This function is internally called in lieu of the floored division operator `/`. In other words, the Jack expression `x / y` and `Math.divide(x, y)` are equivalent.

# How does NAND work?

I'm glad you asked! I've found the following illustrations quite illuminating:

<img src="media/computer.png" width="700">

*taken from [Wikipedia](https://commons.wikimedia.org/wiki/File:Hack_Computer_Block_Diagram_2.png).*

The NAND computer follows the [Harvard architecture](https://en.wikipedia.org/wiki/Harvard_architecture). That is, the instruction memory (ROM) and the data memory (RAM) are separately stored, brought to function in unison by the CPU.

<img src="media/cpu.png" width="700">

*taken from [Wikipedia](https://commons.wikimedia.org/wiki/File:Hack_Computer_Block_Diagram_2.png).*

NAND's CPU is an [accumulator machine](https://en.wikipedia.org/wiki/Accumulator_(computing)#Accumulator_machines), meaning that it is heavily dependent on its built-in registers for control flow (in this case the accumulator is the D register). Don't worry if you don't fully understand what the CPU visualization depicts. Instead, take the perspective of appreciation for how this elegantly simple design powers the entirety of NAND — in your web browser!

<img src="media/alu.png" width="700">

*taken from the [Nand to Tetris lecture slides](https://drive.google.com/file/d/1Z_fxYmmRNXTkAzmZ6YMoX9NXZIRVCKiw/view)*

We've reached the instruction set, the nitty-gritty. As indicated, NAND's CPU only has *two* opcodes! This makes the instruction set relatively simple while providing a rich functionality. NAND's ALU is additionally specified with the expressions it can compute in a single instruction.

Phew! That was a lot to take in, but I promise you NAND is far less complicated than I've made it out to be. From a relatively simple logical foundation, Turing equivalence is achieved! If you want see my implementation of the NAND computer architecture, [you're more than welcome to](src/core)! If you find yourself still curious, check out the [Nand to Tetris lecture slides](https://drive.google.com/file/d/1Z_fxYmmRNXTkAzmZ6YMoX9NXZIRVCKiw/view) for further elaboration on every aspect of the architecture.

Let's briefly talk about the compiler and the virtual machine to make this section feel complete. These concepts are nothing unique to NAND, hence their brevity. Some of NAND's strange syntactical features are a direct consequence of making the compiler easier to implement. The compiler is a [recursive descent parser](https://en.wikipedia.org/wiki/Recursive_descent_parser) on an [LL(1) grammar](https://en.wikipedia.org/wiki/LL_parser), generating virtual machine code to be utilized as a [simple stack machine](https://en.wikipedia.org/wiki/Stack_machine) (a technique that also handles managing [call stacks](https://en.wikipedia.org/wiki/Call_stack)). Each virtual machine instruction is then trivially mapped to assembly and machine code. Once again, you're more than welcome to see my [compiler implementation](src/compiler) for yourself.

# Jack Reference

This majority of this section was taken from the [Nand to Tetris lecture slides](https://drive.google.com/file/d/1CAGF8d3pDIOgqX8NZGzU34PPEzvfTYrk/view) and the [National Taiwan University lecture slides](https://www.csie.ntu.edu.tw/~cyy/courses/introCS/18fall/lectures/handouts/lec13_Jack.pdf).

### Program Structure

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

About this layout:
- Every part in this layout can appear 0 or more times
- The order of the field / static
declarations is arbitrary
- The order of the subroutine declarations is arbitrary
- Each type is either `void`, `int`, `boolean`, `char`, or a class name

A Jack program:
- Defines classes in separate files
- Consists of a collection of one or more classes, one of which must be named `Main`
- Must define the `main` function in the `Main` class, the entry point of the program defined by the Jack OS

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
                Operators. Note that <code>&</code> and <code>|</code> are bitwise and do not short-circuit
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
                <code>char</code>
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
                Function arguments array reference
              </td>
            </tr>
          </tbody>
        </table>
      </td>
    </tr>
    <tr>
      <th>Constants</th>
      <td>
          <i>Integer</i> constants must be positive and in standard decimal notation, e.g., <code>1984</code>. Negative integers like <code>-13</code> are not constants but rather expressions consisting of a unary negative operator applied to an integer constant.<br>
          <br>
          <i>String</i> constants are enclosed within quotation marks and may contain any characters except new lines or quotation marks. Unlike typical programming languages, these characters cannot be escaped within a string, so these characters are instead supplied by the functions <code>String.newLine()</code> and <code>String.doubleQuote()</code> from the OS. <sub><sup>If you manage to read this, say <a href="https://files.bithole.dev/nandy.png">hi</a> to Nandy</sup></sub><br>
          <br>
          <i>Boolean</i> constants can be true or false.<br>
          <br>
          <i>null</i> signifies a null reference (a value of 0).
      </td>
    </tr>
    <tr>
      <th>Identifiers</th>
      <td>
          Identifiers are composed from arbitrarily long sequences of letters, digits, and "_". The first character cannot be a digit.<br>
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
| local variables     | `var` *type varName1, varName2, ...*;<br>Local variables are created just before the subroutine starts running and are deallocated when it returns (like *local variables* in Java)                  | subroutine declaration | The subroutine in which they are declared.                                            |
| parameter variables | *type varName1, varName2, ...*<br>Used to pass arguments to the subroutine. Treated like local variables whose values are initialized "from the outside", just before the subroutine starts running. | subroutine signature   | The subroutine in which they are declared.                                            |

### Statements

| Statement | Syntax                                                                                                                                                                                      | Description                                                                                                                                   |
| --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| let       | `let` *varName = expression*;<br>or<br>`let` *varName*[*expression1*] = *expression2*;                                                                                                      | An assignment operation (where *varName* is either single-valued or an array). The variable kind may be *static, local, field, or parameter*. |
| if        | `if` (expression1) {<br>&nbsp;&nbsp;&nbsp;&nbsp;statements1<br>} `else if` (expression2) {<br>&nbsp;&nbsp;&nbsp;&nbsp;statements2<br>} `else` {<br>&nbsp;&nbsp;&nbsp;&nbsp;statements3<br>} | Typical *if* statement with an optional *else* or *else if* clause. The brackets are optional if there's only one statement.                  |
| while     | `while` (expression) {<br>&nbsp;&nbsp;&nbsp;&nbsp;*statements*<br>}                                                                                                                         | Typical *while* statement. The brackets are optional if there's only one statement.                                                           |
| do        | `do` *function-or-method-call*;                                                                                                                                                             | Used to call a function or a method for its effect, ignoring the returned value.                                                              |
| return    | `return` expression;<br>or<br>`return`;                                                                                                                                                     | Used to return a value from a subroutine. Constructors must return the expression `this`.                                                     |

# Jack OS Reference

This section was adapted from the supplied Nand to Tetris software suite.

### Array

```js
/**
 * Represents an array.
 * In the Jack language, arrays are instances of the Array class.
 * Once declared, the array entries can be accessed using the usual
 * syntax arr[i]. Each array entry can hold a primitive data type as
 * well as any object type. Different array entries can have different
 * data types.
 */
class Array {
    /**
     * Constructs a new array of the given size.
     */
    function Array new(int size);

    /**
     * Deallocates an instance of Array and frees its memory space.
     */
    method void dispose();
}
```

### Keyboard

```js
/**
 * The Keyboard class provides an interface for reading inputs from
 * a standard keyboard.
 */
class Keyboard {
    /**
     * Returns the character code of the currently pressed key,
     * or 0 if no key is currently pressed.
     */
    function char keyPressed();

    /**
     * Waits until a keyboard key is pressed and released, then displays the
     * corresponding character on the screen and returns the character.
     */
    function char readChar();

    /**
     * Prints the message on the screen, reads the next line (until a newLine
     * character) from the keyboard, and returns its value.
     */
    function String readLine(String message);

    /**
     * Prints the message on the screen, reads the next line (until a newline
     * character) from the keyboard, and returns its integer value (until the
     * first non numeric character).
     */
    function int readInt(String message);
}
```

### Math

```js
/**
 * A library of commonly used mathematical functions.
 */
class Math {
    /**
     * Returns the absolute value of x.
     */
    function int abs(int x);

    /**
     * Returns the product of x and y.
     * This function is internally called in lieu of the multiplication
     * operator '*'. In other words, the Jack expression x * y and
     * Math.multiply(x, y) are equivalent.
     */
    function int multiply(int x, int y);

    /**
     * Returns the integer part of x / y.
     * This function is internally called in lieu of the division
     * operator '/'. In other words, the Jack expression x / y and
     * Math.divide(x, y) are equivalent.
     */
    function int divide(int dividend, int divisor);

    /**
     * Returns the integer part of the square root of x.
     */
    function int sqrt(int x);

    /**
     * Returns the greater of the two arguments.
     */
    function int max(int a, int b);

    /**
     * Returns the smaller of the two arguments.
     */
    function int min(int a, int b);
}
```

### Memory

```js
/**
 * This library provides two services: direct access to the computer's main
 * memory (RAM), and allocation and recycling of memory blocks. The NAND RAM
 * consists of 32,768 words, each holding a 16-bit binary number.
 */
class Memory {
    /**
     * Returns the RAM value at the given address.
     */
    function int peek(int address);

    /**
     * Sets the value of the given RAM address to the given value.
     */
    function void poke(int address, int value);

    /**
     * Finds and allocates from the heap a memory block of the specified size and
     * returns a reference to its base address.
     */
    function int alloc(int size);

    /**
     * Deallocates the given object (cast as an array) by making it available for
     * future allocations.
     */
    function void deAlloc(Array o);
}
```

### Output

```js
/**
 * A library of functions for writing text on the screen.
 * The NAND physical screen consists of 512 rows of 256 pixels each.
 * The library uses a fixed font, in which each character is displayed
 * within a frame which is 11 pixels high (including 1 pixel for inter-line
 * spacing) and 8 pixels wide (including 2 pixels for inter-character spacing).
 * The resulting grid accommodates 23 rows (indexed 0..22, top to bottom)
 * of 64 characters each (indexed 0..63, left to right). The top left
 * character position on the screen is indexed (0,0). A cursor, implemented
 * as a small filled square, indicates where the next character will be displayed.
 */
class Output {
    /**
     * Moves the cursor to the j'th column of the i'th row, erasing the character
     * that was there.
     */
    function void moveCursor(int i, int j);

    /**
     * Displays the given character at the cursor location,
     * and advances the cursor one column forward.
     */
    function void printChar(char c);

    /**
     * Displays the given string starting at the cursor location, and advances
     * the cursor appropriately.
     */
    function void printString(String str);

    /**
     * Displays the given integer starting at the cursor location, and advances
     * the cursor appropriately.
     */
    function void printInt(int i);

    /**
     * Advances the cursor to the beginning of the next line.
     */
    function void println();

    /**
     * Erases the character that was last written and moves the cursor one column
     * back.
     */
    function void backSpace();
}
```

### Screen

```js
/**
 * A library of functions for displaying graphics on the screen.
 * The NAND physical screen consists of 256 rows (indexed 0..255, top to bottom)
 * of 512 pixels each (indexed 0..511, left to right). The top left pixel on
 * the screen is indexed (0,0).
 */
class Screen {
    /**
     * Erases the entire screen.
     */
    function void clearScreen();

    /**
     * Sets the current color to be used for all subsequent drawXXX commands.
     * Black is represented by true, white by false.
     */
    function void setColor(boolean b);

    /**
     * Draws the (x, y) pixel using the current color.
     */
    function void drawPixel(int x, int y);

    /**
     * Draws a line from pixel (x1, y1) to pixel (x2, y2) using the current color.
     */
    function void drawLine(int x1, int y1, int x2, int y2);

    /**
     * Draws a filled rectangle whose top left corner is (x1, y1) and bottom
     * right corner is (x2, y2) using the current color.
     */
    function void drawRectangle(int x1, int y1, int x2, int y2);

    /**
     * Draws a filled circle of radius r <= 181 around (x, y) using the current
     * color.
     */
    function void drawCircle(int x, int y, int r);
}
```

### String

```js
/**
 * Represents character strings. In addition for constructing and
 * deallocating strings, the class features methods for getting and setting
 * individual characters of the string, for erasing the string's last character,
 * for appending a character to the string's end, and more typical
 * string-oriented operations.
 */
class String {
    /**
     * Constructs a new empty string with a maximum length of maxLength and
     * initial length of 0.
     */
    constructor String new(int maxLength);

    /**
     * Deallocates an instance of String and frees its memory space.
     */
    method void dispose();

    /**
     * Returns the current length of an instance of String.
     */
    method int length();

    /**
     * Returns the character at the j-th location of an instance of String.
     */
    method char charAt(int j);

    /**
     * Sets the character at the j-th location of an instance of String to c.
     */
    method void setCharAt(int j, char c);

    /**
     * Appends the given character to the end of an instance of String and
     * returns the same instance.
     */
    method String appendChar(char c);

    /**
     * Erases the last character from an instance of String.
     */
    method void eraseLastChar();

    /**
     * Returns the integer value of an instance of String until the first
     * non-numeric character.
     */
    method int intValue();

    /**
     * Sets an instance of String to the representation of the given number.
     */
    method void setInt(int number);

    /**
     * Returns the new line character.
     */
    function char newLine();

    /**
     * Returns the backspace character.
     */
    function char backSpace();

    /**
     * Returns the quotation mark character.
     */
    function char doubleQuote();
}
```

### Sys

```js
/**
 * A library that supports various program execution services.
 */
class Sys {
    /**
     * Halts the program execution.
     */
    function void halt();

    /**
     * Displays the given error code in the format "ERR[errorCode]", and halts
     * the program's execution.
     */
    function void error(int errorCode);

    /**
     * Waits approximately duration milliseconds and returns. Note that this is
     * runtime dependent and may not be accurate.
     */
    function void wait(int duration);
}
```

### Error Codes

If you do something that forces the computer into an invalid state, like computing the result of `1 / 0`, the Jack OS will display one of these error codes in the format "ERR[N]" and immediately terminate the program.

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

# FAQ

### Whoa, is *everything* made from NAND gates?

Well..., I admit the description and title are a little misleading, but still in good faith. The compiler and virtual machine translator are written in Typescript, while the kernel and hardware are emulated in Rust. Just the logic simulator runs computations and memory accesses from NAND gates. Bootstrapping the full tech stack is a feat that isn't unheard of, but such a massive project by itself probably deserves its own separate project.

### Did you design NAND by yourself?

NAND follows the [Nand to Tetris course](https://www.nand2tetris.org) and its [associated book](https://www.amazon.com/Elements-Computing-Systems-second-Principles-dp-0262539802/dp/0262539802/ref=dp_ob_title_bk) (you should definitely check it out, it's an absolutely incredible read). I solely implemented the specification for CPU, assembler, virtual machine translator, and compiler, while porting the platform to the web with its own IDE and user interface.

### If there's only one type, what is the point of specifying types at all?

This question references the fact that under the hood, the signed 16-bit integer is Jack's only real type. We anyways need to be so explicit with types to help the compiler figure out which class certain instance methods belong to. If we declare the Jack variable `s` with the type `String`, `s.appendChar(33)` is transformed during compilation into `String.appendChar(s, 33)`.

### Why does the IDE feel finnicky?

NAND's IDE unfortunately trades implementation simplicity for a worse user experience. It uses the unorthodox [contenteditable](https://medium.engineering/why-contenteditable-is-terrible-122d8a40e480) and hacky cursor positioning logic to get syntax highlighting to work. I myself was surprised that I managed to even bring it to a functional state. As a result, it's slow and noticeably buggy, plus common keybinds don't work. I'm sorry, but for now you'll just need to bear with me.

<hr>

You now know how to program NAND in Jack! And wow! It's been grand voyage of discovery. This write-up only begins to do justice the pure genius behind the computer architecture of the modern world. Hopefully, you gain a newfound appreciation for the Herculean amount of technical complexity it takes to bridge the gap between your code and program output on the screen.

Press "Start" to compile and run your code. The OS will typically take a little under a second to initialize memory and set up its services before you're off to see your program running!

If you've read this far, my heartfelt thank you! Happy coding!
