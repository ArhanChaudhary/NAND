# TODO
* make String work with just String.new if newWithStr isn't found
* new video
* readme in question mark in app

# TODO (genetic algorithm)
* make able to re-place obstacles (actually reallocate memory and stuff)
* random acceleration vector should not actually be random, it slightly modifies current by +-1
* should acceleration vectors mutate in consecutive pairs as it is or individually?
* determine optimal dynamicMutationRate constant (current is 1530)
* BFS constants
* take into account steps dot hasn't reach goal, ie 100 steps to reach 100 fitness is better than 150 steps to **reach** 105 fitness

# TODO (genetic algorithm blog)
* cache pairs of acceleration vectors
* bfs for precomputing fitnesses, diagonal distance, take into account obstacles, the noop case
* screen memory for extra temporary swap space
* coefficients to avoid overflow
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
* mouse input and click input (use RAM 24767 to avoid breaking backwards incompatibility)
