static mut PC_dffout: u16 = 0;
fn PC(in_: u16, load: bool, reset: bool) -> u16 {
    return PC_dffout = PC_reg(
        // reset
        Mux16(
            // load
            Mux16(
                // inc
                Inc16(PC_dffout),
                in_,
                load
            ),
            0,
            reset
        )
    );
}

static mut out: [u16; 4] = [0; 4];

pub fn CPU(inM: u16, instruction: u16, reset: bool) -> StaticArray<u16> {
    let instruction15 = nBit16(instruction, 15);

    // writeM
    out[1] = u16::from(And(nBit16(instruction, 3), instruction15));
    
    let ALUy1 = ARegister(0, false);
    let PCin = slice16_0to14(ALUy1);

    // addressM
    out[2] = PCin;

    // pc
    out[3] = PC(PCin, false, reset);

    let ALUout = ALU(
        DRegister(0, false),
        Mux16(ALUy1, inM, nBit16(instruction, 12)),
        nBit16(instruction, 11),
        nBit16(instruction, 10),
        nBit16(instruction, 9),
        nBit16(instruction, 8),
        nBit16(instruction, 7),
        nBit16(instruction, 6),
    );

    // outM
    out[0] = ALUout;

    let ALUoutisneg = nBit16(ALUout, 15);
    let AlUoutiszero = isZero(ALUout);

    DRegister(
        ALUout,
        And(nBit16(instruction, 4), instruction15)
    );
    PC(
        slice16_0to14(
            ARegister(
                Mux16(instruction, ALUout, instruction15),
                Or(Not(instruction15), nBit16(instruction, 5))
            )
        ),
        And(
            Or(Or(
                And(Not(Or(ALUoutisneg, AlUoutiszero)), nBit16(instruction, 0)), // positive
                And(AlUoutiszero, nBit16(instruction, 1))),
                And(ALUoutisneg, nBit16(instruction, 2))
            ),
            instruction15
        ),
        reset
    );
    return out;
}

fn Memory(in_: u16, load: bool, address: u16) -> u16 {
    // address[14] == 0 means select RAM
    // address[13] == 0 means select Screen
    // address[13] == 1 and address[14] == 1 means select Keyboard
    // 00 => RAM
    // 01 => RAM
    // 10 => SCREEN
    // 11 => KEYBOARD

    let address14 = nBit16(address, 14);
    let out1 = RAM16K(
        in_,
        And(
            Not(address14),
            load
        ),
        address,
    );
    return Mux3Way16(
        out1,
        Screen(
            in_,
            And(And(
                Not(nBit16(address, 13)),
                address14),
                load
            ),
            slice16_0to12(address)
        ),
        Keyboard(),
        slice16_13to14(address),
    );
}

static mut CPUout: [u16; 4] = [0; 4];
fn Computer(reset: bool) -> void {
    CPUout = CPU(
        Memory(0, false, CPUout[2]),
        ROM32K(CPUout[3]),
        reset
    );
    Memory(CPUout[0], CPUout[1] != 0, CPUout[2]);
}

pub fn step(reset: bool) {
    tick();
    Computer(reset);
    tock();
    Computer(reset);
}