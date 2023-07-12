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

// function Main.fibonacci 0
(Main.fibonacci)

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

// push constant 2
@2
D=A
@SP
AM=M+1
A=A-1
M=D

// lt
@AFTER_DO_LT2
D=A
@R15
M=D
@DO_LT
0;JMP
(AFTER_DO_LT2)

// if-goto IF_TRUE
@SP
AM=M-1
D=M
@Main.fibonacci$IF_TRUE
D;JNE

// goto IF_FALSE
@Main.fibonacci$IF_FALSE
0;JMP

// label IF_TRUE
(Main.fibonacci$IF_TRUE)

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

// return
@DO_RETURN
0;JMP

// label IF_FALSE
(Main.fibonacci$IF_FALSE)

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

// push constant 2
@2
D=A
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

// call Main.fibonacci 1
@RETURN_ADDR3
D=A
@SP
AM=M+1
A=A-1
M=D
@AFTER_PUSH_STATE4
D=A
@R15
M=D
@PUSH_STATE
0;JMP
(AFTER_PUSH_STATE4)
@1
D=D-A
@5
D=D-A
@ARG
M=D
@Main.fibonacci
0;JMP
(RETURN_ADDR3)

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

// push constant 1
@1
D=A
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

// call Main.fibonacci 1
@RETURN_ADDR5
D=A
@SP
AM=M+1
A=A-1
M=D
@AFTER_PUSH_STATE6
D=A
@R15
M=D
@PUSH_STATE
0;JMP
(AFTER_PUSH_STATE6)
@1
D=D-A
@5
D=D-A
@ARG
M=D
@Main.fibonacci
0;JMP
(RETURN_ADDR5)

// add
@SP
AM=M-1
D=M
A=A-1
M=M+D

// return
@DO_RETURN
0;JMP

// function Sys.init 0
(Sys.init)

// push constant 4
@4
D=A
@SP
AM=M+1
A=A-1
M=D

// call Main.fibonacci 1
@RETURN_ADDR7
D=A
@SP
AM=M+1
A=A-1
M=D
@AFTER_PUSH_STATE8
D=A
@R15
M=D
@PUSH_STATE
0;JMP
(AFTER_PUSH_STATE8)
@1
D=D-A
@5
D=D-A
@ARG
M=D
@Main.fibonacci
0;JMP
(RETURN_ADDR7)

// label WHILE
(Sys.init$WHILE)

// goto WHILE
@Sys.init$WHILE
0;JMP

