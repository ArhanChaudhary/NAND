There are some specific wrong values that indicate that your Memory.jack
returned identical pointers to allocated segments.  Look at Main.jack to
see where the pointers a, b and c are used.

RAM[8003] = 123      b = a
RAM[8004] = 101      c = a
RAM[8004] = 110      c = b
RAM[8004] = 111      c = a and c = b
RAM[8005] = 11       new b = c
