use crate::arithmetic::{alu, inc16};
use crate::builtins::utils::bit_manipulation::{
    nbit16, slice16_0to12, slice16_0to13, slice16_0to14,
};
use crate::builtins::{hardware, memory};
use crate::gates::{and, is_zero, mux16, not, or};

static mut ADDRESS_M: u16 = 0;

fn cpu(in_m: u16, instruction: u16, reset: bool) -> (u16, bool) {
    let c_instruction = nbit16(instruction, 15);
    let alu_y1 = memory::a_register(0, false);
    unsafe {
        ADDRESS_M = slice16_0to14(alu_y1);
    }
    let alu_out = alu(
        memory::d_register(0, false),
        mux16(alu_y1, in_m, nbit16(instruction, 12)),
        nbit16(instruction, 11),
        nbit16(instruction, 10),
        nbit16(instruction, 9),
        nbit16(instruction, 8),
        nbit16(instruction, 7),
        nbit16(instruction, 6),
    );
    let alu_out_is_zero = is_zero(alu_out);
    let alu_out_is_negative = nbit16(alu_out, 15);
    let do_jump = and(
        or(
            or(
                and(
                    not(or(alu_out_is_negative, alu_out_is_zero)),
                    nbit16(instruction, 0),
                ),
                and(alu_out_is_zero, nbit16(instruction, 1)),
            ),
            and(alu_out_is_negative, nbit16(instruction, 2)),
        ),
        c_instruction,
    );

    memory::d_register(alu_out, and(nbit16(instruction, 4), c_instruction));
    memory::a_register(
        mux16(instruction, alu_out, c_instruction),
        or(not(c_instruction), nbit16(instruction, 5)),
    );
    memory::pc_register(mux16(
        // load
        slice16_0to14(mux16(
            // inc
            inc16(unsafe { memory::PC }),
            alu_y1,
            do_jump,
        )),
        0,
        reset,
    ));
    (alu_out, and(nbit16(instruction, 3), c_instruction))
}

// address[14] == 0 means select RAM
// address[13] == 0 means select Screen
// address[13] == 1 and address[14] == 1 means select Keyboard
fn memory(in_m: u16, load: bool, address_m: u16) -> u16 {
    mux16(
        memory::ram16k(
            in_m,
            and(not(nbit16(address_m, 14)), load),
            slice16_0to13(address_m),
        ),
        mux16(
            memory::screen(
                in_m,
                and(and(not(nbit16(address_m, 13)), nbit16(address_m, 14)), load),
                slice16_0to12(address_m),
            ),
            hardware::keyboard(
                in_m,
                and(and(nbit16(address_m, 13), nbit16(address_m, 14)), load),
            ),
            nbit16(address_m, 13),
        ),
        nbit16(address_m, 14),
    )
}

fn computer(reset: bool) {
    let (out_m, load_m) = cpu(
        memory(0, false, unsafe { ADDRESS_M }),
        memory::rom32k(unsafe { memory::PC }),
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
    // think of this as an extension to memory() at the end of computer()
    hardware::keyboard(0, true);
    hardware::tock();
    computer(true);
    hardware::reset_nand_calls();
}
