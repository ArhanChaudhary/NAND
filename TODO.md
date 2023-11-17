# TODO (genetic algorithm)
let minStep = Dot.getMinStep();
        if (minStep = 32767) {
            let minStep = brainSize; <-- should be brain.getStep() ????
        }
* menu: initialXY goalXY selectObstacles onlyBest continue (different config functions)

# TODO (NAND)
* cannot set variable names to keywords in compiler
* ensure all subroutines are defined at compile time
* compilererror stash, too many static error
* better readme
    * if and else doesn't require bracket
    * [][] works
    * you cant malloc 0 even if the original OS could
    * theres no Sys.error(18) String.eraseLastChar String is empty
    * arguments keyword
* actually code the ui

# TODO (stats testing)
* random acceleration vector shouldnt actually be random, it slightly modifies current by +-1
* should acceleration vectors mutate in consecutive pairs as it is or individually?
* determine optimal dynamicMutationRate constant (current is 1530)

# TODO (for later)
* graphing calculator in jack
* nand in nand
* lisp interpreter
* barrel shifter
* mouse input and click input
* draw screen using prev diff
* move rustwasm.render to worker
* 32 bit architecture