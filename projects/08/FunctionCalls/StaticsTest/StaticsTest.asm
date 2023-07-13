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
(Class1.set) // function Class1.set 0
@ARG // push argument 0
A=M
D=M
@SP
AM=M+1
A=A-1
M=D
@SP // pop static 0
AM=M-1
D=M
@Class1.0
M=D
@ARG // push argument 1
A=M+1
D=M
@SP
AM=M+1
A=A-1
M=D
@SP // pop static 1
AM=M-1
D=M
@Class1.1
M=D
@SP // push constant 0
AM=M+1
A=A-1
M=0
@DO_RETURN // return
0;JMP
(Class1.get) // function Class1.get 0
@Class1.0 // push static 0
D=M
@SP
AM=M+1
A=A-1
M=D
@Class1.1 // push static 1
D=M
@SP
AM=M+1
A=A-1
M=D
@SP // sub
AM=M-1
D=M
A=A-1
M=M-D
@DO_RETURN // return
0;JMP
(Class2.set) // function Class2.set 0
@ARG // push argument 0
A=M
D=M
@SP
AM=M+1
A=A-1
M=D
@SP // pop static 0
AM=M-1
D=M
@Class2.0
M=D
@ARG // push argument 1
A=M+1
D=M
@SP
AM=M+1
A=A-1
M=D
@SP // pop static 1
AM=M-1
D=M
@Class2.1
M=D
@SP // push constant 0
AM=M+1
A=A-1
M=0
@DO_RETURN // return
0;JMP
(Class2.get) // function Class2.get 0
@Class2.0 // push static 0
D=M
@SP
AM=M+1
A=A-1
M=D
@Class2.1 // push static 1
D=M
@SP
AM=M+1
A=A-1
M=D
@SP // sub
AM=M-1
D=M
A=A-1
M=M-D
@DO_RETURN // return
0;JMP
(Sys.init) // function Sys.init 0
@6 // push constant 6
D=A
@SP
AM=M+1
A=A-1
M=D
@8 // push constant 8
D=A
@SP
AM=M+1
A=A-1
M=D
@Class1.set // call Class1.set 2
D=A
@R13
M=D
@2
D=A
@R14
M=D
@CALL_RETURN_ADDR1
D=A
@DO_CALL
0;JMP
(CALL_RETURN_ADDR1)
@SP // pop temp 0
AM=M-1
D=M
@R5
M=D
@23 // push constant 23
D=A
@SP
AM=M+1
A=A-1
M=D
@15 // push constant 15
D=A
@SP
AM=M+1
A=A-1
M=D
@Class2.set // call Class2.set 2
D=A
@R13
M=D
@2
D=A
@R14
M=D
@CALL_RETURN_ADDR2
D=A
@DO_CALL
0;JMP
(CALL_RETURN_ADDR2)
@SP // pop temp 0
AM=M-1
D=M
@R5
M=D
@Class1.get // call Class1.get 0
D=A
@R13
M=D
@R14
M=0
@CALL_RETURN_ADDR3
D=A
@DO_CALL
0;JMP
(CALL_RETURN_ADDR3)
@Class2.get // call Class2.get 0
D=A
@R13
M=D
@R14
M=0
@CALL_RETURN_ADDR4
D=A
@DO_CALL
0;JMP
(CALL_RETURN_ADDR4)
(Sys.init$WHILE) // label WHILE
@Sys.init$WHILE // goto WHILE
0;JMP