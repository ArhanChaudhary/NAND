use crate::arithmetic::{alu, inc16};
use crate::builtins::utils::bit_manipulation::{
    nbit16, slice16_0to12, slice16_0to13, slice16_0to14,
};
use crate::builtins::{hardware, memory};
use crate::gates::{and, is_zero, mux16, not, or};
use std::cell::SyncUnsafeCell;

static PC: SyncUnsafeCell<u16> = SyncUnsafeCell::new(0);
static ADDRESS_M: SyncUnsafeCell<u16> = SyncUnsafeCell::new(0);

fn pc(in_: u16, load: bool, reset: bool) {
    unsafe {
        *PC.get() = slice16_0to14(memory::pc_register(
            // reset
            mux16(
                // load
                mux16(
                    // inc
                    inc16(*PC.get()),
                    in_,
                    load,
                ),
                0,
                reset,
            ),
        ));
    }
}

fn cpu(in_m: u16, instruction: u16, reset: bool) -> (u16, bool) {
    let alu_y1 = memory::a_register(0, false);
    unsafe {
        *ADDRESS_M.get() = slice16_0to14(alu_y1);
    }
    pc(unsafe { *ADDRESS_M.get() }, false, reset);
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

    memory::d_register(
        alu_out,
        and(nbit16(instruction, 4), nbit16(instruction, 15)),
    );
    pc(
        slice16_0to14(memory::a_register(
            mux16(instruction, alu_out, nbit16(instruction, 15)),
            or(not(nbit16(instruction, 15)), nbit16(instruction, 5)),
        )),
        and(
            or(
                or(
                    and(
                        not(or(nbit16(alu_out, 15), alu_out_is_zero)),
                        nbit16(instruction, 0),
                    ), // positive
                    and(alu_out_is_zero, nbit16(instruction, 1)),
                ),
                and(nbit16(alu_out, 15), nbit16(instruction, 2)),
            ),
            nbit16(instruction, 15),
        ),
        reset,
    );
    (
        alu_out,
        and(nbit16(instruction, 3), nbit16(instruction, 15)),
    )
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
        memory(0, false, unsafe { *ADDRESS_M.get() }),
        memory::rom32k(unsafe { *PC.get() }),
        reset,
    );
    memory(out_m, load_m, unsafe { *ADDRESS_M.get() });
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
