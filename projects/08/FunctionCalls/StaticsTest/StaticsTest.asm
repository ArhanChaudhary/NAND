// init
@256
D=A
@SP
M=D
@AFTER_SETUP
0;JMP
// return
(DO_RETURN)
@LCL
D=M-1
@R13
M=D
@4
A=D-A
D=M
@R14
M=D
@SP
A=M-1
D=M
@ARG
A=M
M=D
D=A
@SP
M=D+1
@R13
A=M
D=M
@THAT
M=D
@R13
AM=M-1
D=M
@THIS
M=D
@R13
AM=M-1
D=M
@ARG
M=D
@R13
A=M-1
D=M
@LCL
M=D
@R14
A=M
0;JMP
// push state during call
(PUSH_STATE)
@LCL
D=M
@SP
AM=M+1
A=A-1
M=D
@ARG
D=M
@SP
AM=M+1
A=A-1
M=D
@THIS
D=M
@SP
AM=M+1
A=A-1
M=D
@THAT
D=M
@SP
AM=M+1
A=A-1
M=D
@SP
D=M
@LCL
M=D
@R15
A=M
0;JMP
// lt
(DO_LT)
@SP
AM=M-1
D=M
A=A-1
D=M-D
M=0
@LT_FALSE
D;JGE
@SP
A=M-1
M=-1
(LT_FALSE)
@R15
A=M
0;JMP
// eq
(DO_EQ)
@SP
AM=M-1
D=M
A=A-1
D=M-D
M=0
@EQ_FALSE
D;JNE
@SP
A=M-1
M=-1
(EQ_FALSE)
@R15
A=M
0;JMP
// gt
(DO_GT)
@SP
AM=M-1
D=M
A=A-1
D=M-D
M=0
@GT_FALSE
D;JLE
@SP
A=M-1
M=-1
(GT_FALSE)
@R15
A=M
0;JMP
(AFTER_SETUP)

// call Sys.init 0
@RETURN_ADDR0
D=A
@SP
AM=M+1
A=A-1
M=D
@AFTER_PUSH_STATE1
D=A
@R15
M=D
@PUSH_STATE
0;JMP
(AFTER_PUSH_STATE1)
@0
D=D-A
@5
D=D-A
@ARG
M=D
@Sys.init
0;JMP
(RETURN_ADDR0)

// function Class1.set 0
(Class1.set)

// push argument 0
@ARG
D=M
@0
A=A+D
D=M
@SP
AM=M+1
A=A-1
M=D

// pop static 0
@Class1.0
D=A
@R13
M=D
@SP
AM=M-1
D=M
@R13
A=M
M=D

// push argument 1
@ARG
D=M
@1
A=A+D
D=M
@SP
AM=M+1
A=A-1
M=D

// pop static 1
@Class1.1
D=A
@R13
M=D
@SP
AM=M-1
D=M
@R13
A=M
M=D

// push constant 0
@0
D=A
@SP
AM=M+1
A=A-1
M=D

// return
@DO_RETURN
0;JMP

// function Class1.get 0
(Class1.get)

// push static 0
@Class1.0
D=M
@SP
AM=M+1
A=A-1
M=D

// push static 1
@Class1.1
D=M
@SP
AM=M+1
A=A-1
M=D

// sub
@SP
AM=M-1
D=M
A=A-1
M=M-D

// return
@DO_RETURN
0;JMP

// function Class2.set 0
(Class2.set)

// push argument 0
@ARG
D=M
@0
A=A+D
D=M
@SP
AM=M+1
A=A-1
M=D

// pop static 0
@Class2.0
D=A
@R13
M=D
@SP
AM=M-1
D=M
@R13
A=M
M=D

// push argument 1
@ARG
D=M
@1
A=A+D
D=M
@SP
AM=M+1
A=A-1
M=D

// pop static 1
@Class2.1
D=A
@R13
M=D
@SP
AM=M-1
D=M
@R13
A=M
M=D

// push constant 0
@0
D=A
@SP
AM=M+1
A=A-1
M=D

// return
@DO_RETURN
0;JMP

// function Class2.get 0
(Class2.get)

// push static 0
@Class2.0
D=M
@SP
AM=M+1
A=A-1
M=D

// push static 1
@Class2.1
D=M
@SP
AM=M+1
A=A-1
M=D

// sub
@SP
AM=M-1
D=M
A=A-1
M=M-D

// return
@DO_RETURN
0;JMP

// function Sys.init 0
(Sys.init)

// push constant 6
@6
D=A
@SP
AM=M+1
A=A-1
M=D

// push constant 8
@8
D=A
@SP
AM=M+1
A=A-1
M=D

// call Class1.set 2
@RETURN_ADDR2
D=A
@SP
AM=M+1
A=A-1
M=D
@AFTER_PUSH_STATE3
D=A
@R15
M=D
@PUSH_STATE
0;JMP
(AFTER_PUSH_STATE3)
@2
D=D-A
@5
D=D-A
@ARG
M=D
@Class1.set
0;JMP
(RETURN_ADDR2)

// pop temp 0
@0
D=A
@5
D=D+A
@R13
M=D
@SP
AM=M-1
D=M
@R13
A=M
M=D

// push constant 23
@23
D=A
@SP
AM=M+1
A=A-1
M=D

// push constant 15
@15
D=A
@SP
AM=M+1
A=A-1
M=D

// call Class2.set 2
@RETURN_ADDR4
D=A
@SP
AM=M+1
A=A-1
M=D
@AFTER_PUSH_STATE5
D=A
@R15
M=D
@PUSH_STATE
0;JMP
(AFTER_PUSH_STATE5)
@2
D=D-A
@5
D=D-A
@ARG
M=D
@Class2.set
0;JMP
(RETURN_ADDR4)

// pop temp 0
@0
D=A
@5
D=D+A
@R13
M=D
@SP
AM=M-1
D=M
@R13
A=M
M=D

// call Class1.get 0
@RETURN_ADDR6
D=A
@SP
AM=M+1
A=A-1
M=D
@AFTER_PUSH_STATE7
D=A
@R15
M=D
@PUSH_STATE
0;JMP
(AFTER_PUSH_STATE7)
@0
D=D-A
@5
D=D-A
@ARG
M=D
@Class1.get
0;JMP
(RETURN_ADDR6)

// call Class2.get 0
@RETURN_ADDR8
D=A
@SP
AM=M+1
A=A-1
M=D
@AFTER_PUSH_STATE9
D=A
@R15
M=D
@PUSH_STATE
0;JMP
(AFTER_PUSH_STATE9)
@0
D=D-A
@5
D=D-A
@ARG
M=D
@Class2.get
0;JMP
(RETURN_ADDR8)

// label WHILE
(Sys.init$WHILE)

// goto WHILE
@Sys.init$WHILE
0;JMP

