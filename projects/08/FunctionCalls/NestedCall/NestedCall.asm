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
(Sys.init) // function Sys.init 0
@4000 // push constant 4000
D=A
@SP
AM=M+1
A=A-1
M=D
@SP // pop pointer 0
AM=M-1
D=M
@R3
M=D
@5000 // push constant 5000
D=A
@SP
AM=M+1
A=A-1
M=D
@SP // pop pointer 1
AM=M-1
D=M
@R4
M=D
@Sys.main // call Sys.main 0
D=A
@R13
M=D
@R14
M=0
@CALL_RETURN_ADDR1
D=A
@DO_CALL
0;JMP
(CALL_RETURN_ADDR1)
@SP // pop temp 1
AM=M-1
D=M
@R6
M=D
(Sys.init$LOOP) // label LOOP
@Sys.init$LOOP // goto LOOP
0;JMP
(Sys.main) // function Sys.main 5
@5
D=A
(Sys.main_INIT_LOOP)
@SP
AM=M+1
A=A-1
M=0
D=D-1
@Sys.main_INIT_LOOP
D;JGT
@4001 // push constant 4001
D=A
@SP
AM=M+1
A=A-1
M=D
@SP // pop pointer 0
AM=M-1
D=M
@R3
M=D
@5001 // push constant 5001
D=A
@SP
AM=M+1
A=A-1
M=D
@SP // pop pointer 1
AM=M-1
D=M
@R4
M=D
@200 // push constant 200
D=A
@SP
AM=M+1
A=A-1
M=D
@SP // pop local 1
AM=M-1
D=M
@LCL
A=M+1
M=D
@40 // push constant 40
D=A
@SP
AM=M+1
A=A-1
M=D
@SP // pop local 2
AM=M-1
D=M
@LCL
A=M+1
A=A+1
M=D
@6 // push constant 6
D=A
@SP
AM=M+1
A=A-1
M=D
@SP // pop local 3
AM=M-1
D=M
@LCL
A=M+1
A=A+1
A=A+1
M=D
@123 // push constant 123
D=A
@SP
AM=M+1
A=A-1
M=D
@Sys.add12 // call Sys.add12 1
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
@SP // pop temp 0
AM=M-1
D=M
@R5
M=D
@LCL // push local 0
A=M
D=M
@SP
AM=M+1
A=A-1
M=D
@LCL // push local 1
A=M+1
D=M
@SP
AM=M+1
A=A-1
M=D
@LCL // push local 2
A=M+1
A=A+1
D=M
@SP
AM=M+1
A=A-1
M=D
@LCL // push local 3
D=M
@3
A=A+D
D=M
@SP
AM=M+1
A=A-1
M=D
@LCL // push local 4
D=M
@4
A=A+D
D=M
@SP
AM=M+1
A=A-1
M=D
@SP // add
AM=M-1
D=M
A=A-1
M=M+D
@SP // add
AM=M-1
D=M
A=A-1
M=M+D
@SP // add
AM=M-1
D=M
A=A-1
M=M+D
@SP // add
AM=M-1
D=M
A=A-1
M=M+D
@DO_RETURN // return
0;JMP
(Sys.add12) // function Sys.add12 0
@4002 // push constant 4002
D=A
@SP
AM=M+1
A=A-1
M=D
@SP // pop pointer 0
AM=M-1
D=M
@R3
M=D
@5002 // push constant 5002
D=A
@SP
AM=M+1
A=A-1
M=D
@SP // pop pointer 1
AM=M-1
D=M
@R4
M=D
@ARG // push argument 0
A=M
D=M
@SP
AM=M+1
A=A-1
M=D
@12 // push constant 12
D=A
@SP
AM=M+1
A=A-1
M=D
@SP // add
AM=M-1
D=M
A=A-1
M=M+D
@DO_RETURN // return
0;JMP