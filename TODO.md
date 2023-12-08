# TODO (genetic algorithm)
* showAllDots doesnt display obstacles
* goal and initial dot gui

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
* actually code the ui (viewable ram and rom)

# TODO (stats testing)
* random acceleration vector shouldnt actually be random, it slightly modifies current by +-1
* should acceleration vectors mutate in consecutive pairs as it is or individually?
* determine optimal dynamicMutationRate constant (current is 1530)
* BFS constants

# TODO (for later)
* take into account steps dot hasnt reach goal, ie 100 steps to reach 100 fitness is better than 150 steps to reach 105 fitness
* graphing calculator in jack
* nand in nand
* lisp interpreter
* barrel shifter
* mouse input and click input
* draw screen using prev diff
* move rustwasm.render to worker
* 32 bit architecture