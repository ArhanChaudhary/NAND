@256 // init
D=A
@SP
M=D
@AFTER_SETUP
0;JMP
(DO_RETURN) // return
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
(DO_CALL) // push state and goto functionName
@SP
AM=M+1
A=A-1
M=D
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
@R14
A=M
D=D-A
@5
D=D-A
@ARG
M=D
@R13
A=M
0;JMP
(DO_LT) // lt
@R15
M=D
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
(DO_EQ) // eq
@R15
M=D
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
(DO_GT) // gt
@R15
M=D
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
@Sys.init // call Sys.init 0
D=A
@R13
M=D
@R14
M=0
@CALL_RETURN_ADDR0
D=A
@DO_CALL
0;JMP
(CALL_RETURN_ADDR0)
(Main.fibonacci) // function Main.fibonacci 0
@ARG // push argument 0
A=M
D=M
@SP
AM=M+1
A=A-1
M=D
@2 // push constant 2
D=A
@SP
AM=M+1
A=A-1
M=D
@AFTER_DO_LT1 // lt
D=A
@DO_LT
0;JMP
(AFTER_DO_LT1)
@SP // if-goto IF_TRUE
AM=M-1
D=M
@Main.fibonacci$IF_TRUE
D;JNE
@Main.fibonacci$IF_FALSE // goto IF_FALSE
0;JMP
(Main.fibonacci$IF_TRUE) // label IF_TRUE
@ARG // push argument 0
A=M
D=M
@SP
AM=M+1
A=A-1
M=D
@DO_RETURN // return
0;JMP
(Main.fibonacci$IF_FALSE) // label IF_FALSE
@ARG // push argument 0
A=M
D=M
@SP
AM=M+1
A=A-1
M=D
@2 // push constant 2
D=A
@SP
AM=M+1
A=A-1
M=D
@SP // sub
AM=M-1
D=M
A=A-1
M=M-D
@Main.fibonacci // call Main.fibonacci 1
D=A
@R13
M=D
@R14
M=1
@CALL_RETURN_ADDR2
D=A
@DO_CALL
0;JMP
(CALL_RETURN_ADDR2)
@ARG // push argument 0
A=M
D=M
@SP
AM=M+1
A=A-1
M=D
@SP // push constant 1
AM=M+1
A=A-1
M=1
@SP // sub
AM=M-1
D=M
A=A-1
M=M-D
@Main.fibonacci // call Main.fibonacci 1
D=A
@R13
M=D
@R14
M=1
@CALL_RETURN_ADDR3
D=A
@DO_CALL
0;JMP
(CALL_RETURN_ADDR3)
@SP // add
AM=M-1
D=M
A=A-1
M=M+D
@DO_RETURN // return
0;JMP
(Sys.init) // function Sys.init 0
@4 // push constant 4
D=A
@SP
AM=M+1
A=A-1
M=D
@Main.fibonacci // call Main.fibonacci 1
D=A
@R13
M=D
@R14
M=1
@CALL_RETURN_ADDR4
D=A
@DO_CALL
0;JMP
(CALL_RETURN_ADDR4)
(Sys.init$WHILE) // label WHILE
@Sys.init$WHILE // goto WHILE
0;JMP