# TODO (NAND)
* readme
  * Writing programs in NAND
    * max ROM 32768 and max static 240
    * jack tutorial, base off https://www.csie.ntu.edu.tw/~cyy/courses/introCS/13fall/lectures/handouts/lec11_Jack.pdf and https://www.csie.ntu.edu.tw/~cyy/courses/introCS/13fall/lectures/handouts/lec11_Jack.pdf
    * if and else doesn't require bracket
    * [][] works
    * you cant malloc 0 even if the original OS could
    * theres no Sys.error(18) String.eraseLastChar String is empty
    * arguments keyword (nArgs doesnt matter)
    * ub: abs -32768, stack overflows, heap overflows, modifying stack frame or registers,
    * start will automatically reset on IDE input
    * document key register 32767 to stop
  * NAND's example programs
    * Average
    * Pong
    * Square
    * Overflow
    * 2048
    * GeneticAlgorithm (will not reallocate)
  * FAQ
    * not actually entirely nand, rust wasm
    * ide is slow and finnicky and buggy
    * PC A D are CPU registers
    * i didnt design it and credits to book
# TODO (genetic algorithm)
* make able to re-place obstacles (actually reallocate memory and stuff)
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
* vm escape bug

# TODO (for later)
* IDE on safari is really buggy
* breakpoints
* graphing calculator in jack
* nand in nand
* lisp interpreter
* barrel shifter
* mouse input and click input (use RAM 24767 to avoid breaking backwards incompat)
