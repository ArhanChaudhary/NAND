// function Sys.init 0
(Sys.init)

// push constant 4000
@4000
D=A
@SP
AM=M+1
A=A-1
M=D

// pop pointer 0
@0
D=A
@3
D=D+A
@R13
M=D
@SP
AM=M-1
D=M
@R13
A=M
M=D

// push constant 5000
@5000
D=A
@SP
AM=M+1
A=A-1
M=D

// pop pointer 1
@1
D=A
@3
D=D+A
@R13
M=D
@SP
AM=M-1
D=M
@R13
A=M
M=D

// call Sys.main 0
@RETURN_ADDR0
D=A
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
@0
D=D-A
@5
D=D-A
@ARG
M=D
@Sys.main
0;JMP
(RETURN_ADDR0)

// pop temp 1
@1
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

// label LOOP
(Sys.init$LOOP)

// goto LOOP
@Sys.init$LOOP
0;JMP

// function Sys.main 5
(Sys.main)
@SP
A=M
M=0
A=A+1
M=0
A=A+1
M=0
A=A+1
M=0
A=A+1
M=0
AD=A+1
@SP
M=D

// push constant 4001
@4001
D=A
@SP
AM=M+1
A=A-1
M=D

// pop pointer 0
@0
D=A
@3
D=D+A
@R13
M=D
@SP
AM=M-1
D=M
@R13
A=M
M=D

// push constant 5001
@5001
D=A
@SP
AM=M+1
A=A-1
M=D

// pop pointer 1
@1
D=A
@3
D=D+A
@R13
M=D
@SP
AM=M-1
D=M
@R13
A=M
M=D

// push constant 200
@200
D=A
@SP
AM=M+1
A=A-1
M=D

// pop local 1
@1
D=A
@LCL
D=D+M
@R13
M=D
@SP
AM=M-1
D=M
@R13
A=M
M=D

// push constant 40
@40
D=A
@SP
AM=M+1
A=A-1
M=D

// pop local 2
@2
D=A
@LCL
D=D+M
@R13
M=D
@SP
AM=M-1
D=M
@R13
A=M
M=D

// push constant 6
@6
D=A
@SP
AM=M+1
A=A-1
M=D

// pop local 3
@3
D=A
@LCL
D=D+M
@R13
M=D
@SP
AM=M-1
D=M
@R13
A=M
M=D

// push constant 123
@123
D=A
@SP
AM=M+1
A=A-1
M=D

// call Sys.add12 1
@RETURN_ADDR1
D=A
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
@1
D=D-A
@5
D=D-A
@ARG
M=D
@Sys.add12
0;JMP
(RETURN_ADDR1)

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

// push local 0
@LCL
D=M
@0
A=A+D
D=M
@SP
AM=M+1
A=A-1
M=D

// push local 1
@LCL
D=M
@1
A=A+D
D=M
@SP
AM=M+1
A=A-1
M=D

// push local 2
@LCL
D=M
@2
A=A+D
D=M
@SP
AM=M+1
A=A-1
M=D

// push local 3
@LCL
D=M
@3
A=A+D
D=M
@SP
AM=M+1
A=A-1
M=D

// push local 4
@LCL
D=M
@4
A=A+D
D=M
@SP
AM=M+1
A=A-1
M=D

// add
@SP
AM=M-1
D=M
A=A-1
M=M+D

// add
@SP
AM=M-1
D=M
A=A-1
M=M+D

// add
@SP
AM=M-1
D=M
A=A-1
M=M+D

// add
@SP
AM=M-1
D=M
A=A-1
M=M+D

// return
@LCL
D=M-1
@R14
M=D
@4
A=D-A
D=M
@R15
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
@R14
A=M
D=M
@THAT
M=D
@R14
AM=M-1
D=M
@THIS
M=D
@R14
AM=M-1
D=M
@ARG
M=D
@R14
A=M-1
D=M
@LCL
M=D
@R15
A=M
0;JMP

// function Sys.add12 0
(Sys.add12)

// push constant 4002
@4002
D=A
@SP
AM=M+1
A=A-1
M=D

// pop pointer 0
@0
D=A
@3
D=D+A
@R13
M=D
@SP
AM=M-1
D=M
@R13
A=M
M=D

// push constant 5002
@5002
D=A
@SP
AM=M+1
A=A-1
M=D

// pop pointer 1
@1
D=A
@3
D=D+A
@R13
M=D
@SP
AM=M-1
D=M
@R13
A=M
M=D

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

// push constant 12
@12
D=A
@SP
AM=M+1
A=A-1
M=D

// add
@SP
AM=M-1
D=M
A=A-1
M=M+D

// return
@LCL
D=M-1
@R14
M=D
@4
A=D-A
D=M
@R15
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
@R14
A=M
D=M
@THAT
M=D
@R14
AM=M-1
D=M
@THIS
M=D
@R14
AM=M-1
D=M
@ARG
M=D
@R14
A=M-1
D=M
@LCL
M=D
@R15
A=M
0;JMP

