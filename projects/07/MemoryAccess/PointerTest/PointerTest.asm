// push constant 3030
@3030
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

// push constant 3040
@3040
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

// push constant 32
@32
D=A
@SP
AM=M+1
A=A-1
M=D

// pop this 2
@2
D=A
@THIS
D=D+M
@R13
M=D
@SP
AM=M-1
D=M
@R13
A=M
M=D

// push constant 46
@46
D=A
@SP
AM=M+1
A=A-1
M=D

// pop that 6
@6
D=A
@THAT
D=D+M
@R13
M=D
@SP
AM=M-1
D=M
@R13
A=M
M=D

// push pointer 0
@3
D=A
@0
A=A+D
D=M
@SP
AM=M+1
A=A-1
M=D

// push pointer 1
@3
D=A
@1
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

// push this 2
@THIS
D=M
@2
A=A+D
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

// push that 6
@THAT
D=M
@6
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

