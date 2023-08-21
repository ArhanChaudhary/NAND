use wasm_bindgen::prelude::wasm_bindgen;

use crate::{pc_reg, gates::{mux16, and, is_zero, or, not}, arithmetic::{inc16, alu}, nbit16, aregister, slice16_0to14, dregister, screen, slice16_0to12, rom32k, tick, tock, ram16k, keyboard, bool_from_u16, u16_from_bool};

static mut PC_DFFOUT: u16 = 0;
fn pc(in_: u16, load: bool, reset: bool) -> u16 {
    unsafe { PC_DFFOUT = pc_reg(
        // reset
        mux16(
            // load
            mux16(
                // inc
                inc16(PC_DFFOUT),
                in_,
                load
            ),
            0,
            reset
        )
    )};
    unsafe { PC_DFFOUT }
}

static mut CPU_DFFOUT: [u16; 4] = [0; 4];

pub fn cpu(in_m: u16, instruction: u16, reset: bool) -> [u16; 4] {
    let instruction15 = nbit16(instruction, 15);

    // writeM
    unsafe { CPU_DFFOUT[1] = u16_from_bool(and(nbit16(instruction, 3), instruction15)) };
    
    let aluy1 = aregister(0, false);
    let pcin = slice16_0to14(aluy1);

    // addressM
    unsafe { CPU_DFFOUT[2] = pcin };

    // pc
    unsafe { CPU_DFFOUT[3] = pc(pcin, false, reset) };

    let aluout = alu(
        dregister(0, false),
        mux16(aluy1, in_m, nbit16(instruction, 12)),
        nbit16(instruction, 11),
        nbit16(instruction, 10),
        nbit16(instruction, 9),
        nbit16(instruction, 8),
        nbit16(instruction, 7),
        nbit16(instruction, 6),
    );

    // outM
    unsafe { CPU_DFFOUT[0] = aluout };

    let aluoutisneg = nbit16(aluout, 15);
    let aluoutiszero = is_zero(aluout);

    dregister(
        aluout,
        and(nbit16(instruction, 4), instruction15)
    );
    pc(
        slice16_0to14(
            aregister(
                mux16(instruction, aluout, instruction15),
                or(not(instruction15), nbit16(instruction, 5))
            )
        ),
        and(
            or(or(
                and(not(or(aluoutisneg, aluoutiszero)), nbit16(instruction, 0)), // positive
                and(aluoutiszero, nbit16(instruction, 1))),
                and(aluoutisneg, nbit16(instruction, 2))
            ),
            instruction15
        ),
        reset
    );
    unsafe { CPU_DFFOUT }
}

fn memory(in_: u16, load: bool, address: u16) -> u16 {
    // address[14] == 0 means select RAM
    // address[13] == 0 means select Screen
    // address[13] == 1 and address[14] == 1 means select Keyboard
    // 00 => RAM
    // 01 => RAM
    // 10 => SCREEN
    // 11 => KEYBOARD

    let address14 = nbit16(address, 14);

    mux16(
        ram16k(
            in_,
            and(
                not(address14),
                load
            ),
            address,
        ),
        mux16(
            screen(
                in_,
                and(and(
                    not(nbit16(address, 13)),
                    address14),
                    load
                ),
                slice16_0to12(address)
            ),
            keyboard(false, 0),
            nbit16(address, 13)
        ),
        nbit16(address, 14)
    )
}

static mut COMPUTER_DFFOUT: [u16; 4] = [0; 4];
fn computer(reset: bool) {
    unsafe { COMPUTER_DFFOUT = cpu(
        memory(0, false, COMPUTER_DFFOUT[2]),
        rom32k(COMPUTER_DFFOUT[3]),
        reset
    ) };
    unsafe { memory(COMPUTER_DFFOUT[0], bool_from_u16(COMPUTER_DFFOUT[1]), COMPUTER_DFFOUT[2]) };
}

#[wasm_bindgen]
pub fn ticktock(reset: bool) {
    tick();
    computer(reset);
    tock();
    computer(reset);
}