use crate::{
    arithmetic::{alu, inc16},
    builtins::{
        bit_manipulation::{nbit16, slice16_0to12, slice16_0to13, slice16_0to14},
        hardware, memory,
    },
    gates::{and, is_zero, mux16, not, or},
};

static mut PC_DFFOUT: u16 = 0;
fn pc(in_: u16, load: bool, reset: bool) -> u16 {
    unsafe {
        PC_DFFOUT = memory::pcregister(
            // reset
            mux16(
                // load
                mux16(
                    // inc
                    inc16(PC_DFFOUT),
                    in_,
                    load,
                ),
                0,
                reset,
            ),
        );
    }
    unsafe { PC_DFFOUT }
}

static mut ADDRESS_M: u16 = 0;
static mut PC: u16 = 0;
fn cpu(in_m: u16, instruction: u16, reset: bool) -> (u16, bool) {
    let aluy1 = memory::aregister(0, false);
    unsafe { ADDRESS_M = slice16_0to14(aluy1) };
    unsafe { PC = slice16_0to14(pc(slice16_0to14(aluy1), false, reset)) };
    let aluout = alu(
        memory::dregister(0, false),
        mux16(aluy1, in_m, nbit16(instruction, 12)),
        nbit16(instruction, 11),
        nbit16(instruction, 10),
        nbit16(instruction, 9),
        nbit16(instruction, 8),
        nbit16(instruction, 7),
        nbit16(instruction, 6),
    );

    let aluoutiszero = is_zero(aluout);

    memory::dregister(aluout, and(nbit16(instruction, 4), nbit16(instruction, 15)));
    pc(
        slice16_0to14(memory::aregister(
            mux16(instruction, aluout, nbit16(instruction, 15)),
            or(not(nbit16(instruction, 15)), nbit16(instruction, 5)),
        )),
        and(
            or(
                or(
                    and(
                        not(or(nbit16(aluout, 15), aluoutiszero)),
                        nbit16(instruction, 0),
                    ), // positive
                    and(aluoutiszero, nbit16(instruction, 1)),
                ),
                and(nbit16(aluout, 15), nbit16(instruction, 2)),
            ),
            nbit16(instruction, 15),
        ),
        reset,
    );
    (aluout, and(nbit16(instruction, 3), nbit16(instruction, 15)))
}

fn memory(in_m: u16, load: bool, address: u16) -> u16 {
    // address[14] == 0 means select RAM
    // address[13] == 0 means select Screen
    // address[13] == 1 and address[14] == 1 means select Keyboard
    // 00 => RAM
    // 01 => RAM
    // 10 => SCREEN
    // 11 => KEYBOARD

    mux16(
        memory::ram16k(
            in_m,
            and(not(nbit16(address, 14)), load),
            slice16_0to13(address),
        ),
        mux16(
            memory::screen(
                in_m,
                and(and(not(nbit16(address, 13)), nbit16(address, 14)), load),
                slice16_0to12(address),
            ),
            hardware::keyboard(
                in_m,
                and(and(nbit16(address, 13), nbit16(address, 14)), load),
            ),
            nbit16(address, 13),
        ),
        nbit16(address, 14),
    )
}

fn computer(reset: bool) {
    let (out_m, load_m) = cpu(
        memory(0, false, unsafe { ADDRESS_M }),
        memory::rom32k(unsafe { PC }),
        reset,
    );
    memory(out_m, load_m, unsafe { ADDRESS_M });
}

pub fn ticktock() {
    hardware::tick();
    computer(false);
    hardware::tock();
    computer(false);
}

pub fn reset() {
    hardware::tick();
    computer(true);
    hardware::tock();
    computer(true);
    hardware::reset_nand_calls();
    hardware::keyboard(0, true);
}
