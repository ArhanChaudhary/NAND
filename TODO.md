# TODO (NAND)
* "about" button
* make able to re-place obstacles (actually reallocate memory and stuff)
* switch canvas to webgl experiment
* every wasm flag (not all features like mutable_globals and bulk_memory etc might be needed), test if current flags actually help
* no support for safari <= 16.2 which becomes <= 16.7 if i support webgl

* touch events for divider on mobile
* mobile virtual keyboard?
* dont scroll to focused tab on drag
* make sure class name is valid (look in compiler)
* common keybinds like undo etc
* viewable ram and rom
* a lot more comments and remove comments on example programs
* optimize or -1 instruction

* cannot set variable names to keywords in compiler
* ensure all subroutines and classes are defined at compile time
* syntax highlighter (other types)
* compilererror stash, too many static error
* readme
  * Writing programs in NAND
    * jack tutorial, base off https://www.csie.ntu.edu.tw/~cyy/courses/introCS/13fall/lectures/handouts/lec11_Jack.pdf and https://www.csie.ntu.edu.tw/~cyy/courses/introCS/13fall/lectures/handouts/lec11_Jack.pdf
    * if and else doesn't require bracket
    * [][] works
    * you cant malloc 0 even if the original OS could
    * theres no Sys.error(18) String.eraseLastChar String is empty
    * arguments keyword
    * ub: abs -32768, stack overflows, heap overflows, modifying stack frame or registers,
    * start will automatically reset on IDE input
    * document key register 32767 to stop
  * NAND's example programs
    * HelloWorld
    * Average
    * Pong
    * Square
    * Static
    * Overflow
    * 2048
    * GeneticAlgorithm (will not reallocate)
* vm escape bug
* maybe a template for multithreaded svelte?
* read abt desynchronized

# TODO (genetic algorithm)
* random acceleration vector shouldnt actually be random, it slightly modifies current by +-1
* should acceleration vectors mutate in consecutive pairs as it is or individually?
* determine optimal dynamicMutationRate constant (current is 1530)
* BFS constants
* take into account steps dot hasnt reach goal, ie 100 steps to reach 100 fitness is better than 150 steps to reach 105 fitness

# TODO (blog)
* cache pairs of acceleration vectors
* bfs for precomputing fitnesses, diagonal distance, take into account obstacles, the noop case
* screen memory for extra swap space
* coefs to avoid overflow
* lcg for random and scale down
* heap memory over read bug
* efficient collision detection
* fitness stepWeight
* dynamic mutation rate by regressing binomial distributions for different brain steps
* choose population count based on remaining memory
* unsigned division for more range for fitness
* raster bit packing
* string ascii packing
* throw out part of the OS
* A=-A ROM optimization

# TODO (for later)
* graphing calculator in jack
* nand in nand
* lisp interpreter
* barrel shifter
* mouse input and click input (use RAM 24767 to avoid breaking backwards incompat)
