# TODO (NAND)
* define pixel_data as a u32 and then cast it to a *const u8
* is it more efficient to make PIXEL_DATA a global?
* redefine onmessage thing
* find out a way to pass WebAssembly.Module in the screen init
* you need both rustflags and cargo config.toml lmao???? why doesnt it work
* not all features like mutable_globals and bulk_memory etc might be needed
* ensure alpha false and other flags actually make the screen faster
* look into https://github.com/rustwasm/wasm-pack/issues/1328
* move rustwasm.render to worker https://rustwasm.github.io/wasm-bindgen/examples/wasm-in-web-worker.html and https://github.com/rustwasm/wasm-bindgen/tree/main/examples/wasm-in-web-worker
* maybe a template for multithreaded svelte?
* dont scroll to focused tab on drag
* make sure class name is valid (look in compiler)
* common keybinds like undo etc
* viewable ram and rom
* a lot more comments and remove comments on example programs

* cannot set variable names to keywords in compiler
* ensure all subroutines and classes are defined at compile time
* syntax highlighter (other types)
* compilererror stash, too many static error
* make NAND work on desktop safari
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
* mouse input and click input
* draw screen using prev diff
* 32 bit architecture