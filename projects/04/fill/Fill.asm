// This file is part of www.nand2tetris.org
// and the book "The Elements of Computing Systems"
// by Nisan and Schocken, MIT Press.
// File name: projects/04/Fill.asm

// Runs an infinite loop that listens to the keyboard input.
// When a key is pressed (any key), the program blackens the screen,
// i.e. writes "black" in every pixel;
// the screen should remain fully black as long as the key is pressed. 
// When no key is pressed, the program clears the screen, i.e. writes
// "white" in every pixel;
// the screen should remain fully clear as long as no key is pressed.
(LISTENER_LOOP)
    @SCREEN
    D=A
    @curr
    M=D
    @KBD
    D=M
    @MAKE_BLACK
    D;JGT
    @MAKE_WHITE
    0;JMP
(MAKE_BLACK)
    @curr
    D=M
    @SCREEN
    A=D
    M=-1
    @curr
    MD=M+1
    @KBD
    D=D-A
    @LISTENER_LOOP
    D;JEQ
    @MAKE_BLACK
    0;JMP
(MAKE_WHITE)
    @curr
    D=M
    @SCREEN
    A=D
    M=0
    @curr
    MD=M+1
    @KBD
    D=D-A
    @LISTENER_LOOP
    D;JEQ
    @MAKE_WHITE
    0;JMP
