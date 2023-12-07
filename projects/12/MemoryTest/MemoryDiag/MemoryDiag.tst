// This file is part of www.nand2tetris.org
// and the book "The Elements of Computing Systems"
// by Nisan and Schocken, MIT Press.
// File name: projects/12/MemoryTest/MemoryDiag/MemoryDiag.tst

echo "At the end of this test it is normal to see some pixels set on the screen";
load,
output-file MemoryDiag.out,
compare-to MemoryDiag.cmp,
output-list RAM[17000]%D2.6.1 RAM[17001]%D2.6.1 RAM[17002]%D2.6.1
    RAM[17003]%D2.6.1 RAM[17004]%D2.6.1 RAM[17005]%D2.6.1 RAM[17006]%D2.6.1
    RAM[17007]%D2.6.1 RAM[17008]%D2.6.1;

repeat 1000000 {
  vmstep;
}

output;
