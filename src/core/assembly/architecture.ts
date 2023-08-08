import { ALU, Inc16 } from "./arithmetic";
import { ARegister, DRegister, Keyboard, PC_reg, RAM16K, ROM32K, Screen, nBit16, slice16_0to12, slice16_0to14, slice16_13to14, tick, tock } from "./builtins";
import { And, Mux16, Mux3Way16, Not, Or, isZero } from "./gates";

let PC_dffout: u16 = 0;
// @ts-ignore
@inline
function PC(in_: u16, load: boolean, reset: boolean): u16 {
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

const out = new StaticArray<u16>(4);

// @ts-ignore
@inline
export function CPU(inM: u16, instruction: u16, reset: boolean): StaticArray<u16> {
    const instruction15 = nBit16(instruction, 15);

    // @ts-ignore
    // writeM
    out[1] = <u16>And(nBit16(instruction, 3), instruction15);
    
    const ALUy1 = ARegister(0, false);
    const PCin = slice16_0to14(ALUy1);

    // addressM
    out[2] = PCin;

    // pc
    out[3] = PC(PCin, false, reset);

    const ALUout = ALU(
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

    const ALUoutisneg = nBit16(ALUout, 15);
    const AlUoutiszero = isZero(ALUout);

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

// @ts-ignore
@inline
function Memory(in_: u16, load: boolean, address: u16): u16 {
    // address[14] == 0 means select RAM
    // address[13] == 0 means select Screen
    // address[13] == 1 and address[14] == 1 means select Keyboard
    // 00 => RAM
    // 01 => RAM
    // 10 => SCREEN
    // 11 => KEYBOARD

    const address14 = nBit16(address, 14);
    const out1 = RAM16K(
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

let CPUout: StaticArray<u16> = [0, 0, 0, 0];
// @ts-ignore
@inline
function Computer(reset: boolean): void {
    CPUout = CPU(
        Memory(0, false, CPUout[2]),
        ROM32K(CPUout[3]),
        reset
    );
    // @ts-ignore
    Memory(CPUout[0], <boolean>CPUout[1], CPUout[2]);
}

export function step(reset: boolean = false): void {
    tick();
    Computer(reset);
    tock();
    Computer(reset);
}