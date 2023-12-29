# TODO (genetic algorithm)
* make goal cursor more natural
* initial goal gui

# TODO (NAND)
* add github logo
* actually code the ui (viewable ram and rom)
* order example programs
* move rustwasm.render to worker https://rustwasm.github.io/wasm-bindgen/examples/wasm-in-web-worker.html and https://github.com/rustwasm/wasm-bindgen/tree/main/examples/wasm-in-web-worker
* figure out why copying the static arrays in builtins.rs is 50x slower
* cannot set variable names to keywords in compiler
* ensure all subroutines are defined at compile time
* compilererror stash, too many static error
* readme
  * Writing programs in NAND
    * jack tutorial, base of https://www.csie.ntu.edu.tw/~cyy/courses/introCS/13fall/lectures/handouts/lec11_Jack.pdf and https://www.csie.ntu.edu.tw/~cyy/courses/introCS/13fall/lectures/handouts/lec11_Jack.pdf
    * if and else doesn't require bracket
    * [][] works
    * you cant malloc 0 even if the original OS could
    * theres no Sys.error(18) String.eraseLastChar String is empty
    * arguments keyword
    * ub: abs -32768, stack overflows, heap overflows, modifying stack frame or registers,
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

# TODO (stats testing)
* random acceleration vector shouldnt actually be random, it slightly modifies current by +-1
* should acceleration vectors mutate in consecutive pairs as it is or individually?
* determine optimal dynamicMutationRate constant (current is 1530)
* BFS constants

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

# TODO (for later)
* take into account steps dot hasnt reach goal, ie 100 steps to reach 100 fitness is better than 150 steps to reach 105 fitness
* graphing calculator in jack
* nand in nand
* lisp interpreter
* barrel shifter
* mouse input and click input
* draw screen using prev diff
* 32 bit architecture