# TODO (NAND)
* readme
  * Writing programs in NAND
    * divide the Jack tutorial into more subsections
    * reference readme in app
    * arguments keyword in docs (nArgs doesnt matter)
    * if and else doesn't require bracket
    * [][] works

    * ub: abs -32768, stack overflows, heap overflows, modifying stack frame or registers,
    * hardware limitations
      * max ROM 32768 and max static 240 and max stack 1792 and screen stuff and multi keyboard input

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
* breakpoints
* nand in nand
* lisp interpreter
* barrel shifter
* mouse input and click input (use RAM 24767 to avoid breaking backwards incompat)
