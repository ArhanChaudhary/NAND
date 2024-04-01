use crate::builtins::hardware;
use crate::builtins::utils::bit_manipulation::{nbit16, word16_16};
use crate::gates::{and16, mux16, not, not16};

fn half_adder(a: bool, b: bool) -> (bool, bool) {
    let cache1 = hardware::NAND(a, b);
    let cache2 = hardware::NAND(a, cache1);
    let cache3 = hardware::NAND(cache1, b);
    (hardware::NAND(cache2, cache3), not(cache1))
}

fn partial_full_adder(a: bool, b: bool, c: bool) -> bool {
    let cache1 = hardware::NAND(a, b);
    let cache2 = hardware::NAND(hardware::NAND(cache1, a), hardware::NAND(cache1, b));
    let cache3 = hardware::NAND(cache2, c);
    hardware::NAND(hardware::NAND(cache2, cache3), hardware::NAND(cache3, c))
}

fn full_adder(a: bool, b: bool, c: bool) -> (bool, bool) {
    let cache1 = hardware::NAND(a, b);
    let cache2 = hardware::NAND(hardware::NAND(cache1, a), hardware::NAND(cache1, b));
    let cache3 = hardware::NAND(cache2, c);
    (
        hardware::NAND(hardware::NAND(cache2, cache3), hardware::NAND(cache3, c)),
        hardware::NAND(cache1, cache3),
    )
}

fn add16(a: u16, b: u16) -> u16 {
    let (sum0, carry0) = half_adder(nbit16(a, 0), nbit16(b, 0));
    let (sum1, carry1) = full_adder(nbit16(a, 1), nbit16(b, 1), carry0);
    let (sum2, carry2) = full_adder(nbit16(a, 2), nbit16(b, 2), carry1);
    let (sum3, carry3) = full_adder(nbit16(a, 3), nbit16(b, 3), carry2);
    let (sum4, carry4) = full_adder(nbit16(a, 4), nbit16(b, 4), carry3);
    let (sum5, carry5) = full_adder(nbit16(a, 5), nbit16(b, 5), carry4);
    let (sum6, carry6) = full_adder(nbit16(a, 6), nbit16(b, 6), carry5);
    let (sum7, carry7) = full_adder(nbit16(a, 7), nbit16(b, 7), carry6);
    let (sum8, carry8) = full_adder(nbit16(a, 8), nbit16(b, 8), carry7);
    let (sum9, carry9) = full_adder(nbit16(a, 9), nbit16(b, 9), carry8);
    let (sum10, carry10) = full_adder(nbit16(a, 10), nbit16(b, 10), carry9);
    let (sum11, carry11) = full_adder(nbit16(a, 11), nbit16(b, 11), carry10);
    let (sum12, carry12) = full_adder(nbit16(a, 12), nbit16(b, 12), carry11);
    let (sum13, carry13) = full_adder(nbit16(a, 13), nbit16(b, 13), carry12);
    let (sum14, carry14) = full_adder(nbit16(a, 14), nbit16(b, 14), carry13);
    let sum15 = partial_full_adder(nbit16(a, 15), nbit16(b, 15), carry14);
    word16_16(
        sum0, sum1, sum2, sum3, sum4, sum5, sum6, sum7, sum8, sum9, sum10, sum11, sum12, sum13,
        sum14, sum15,
    )
}

pub fn inc16(a: u16) -> u16 {
    add16(a, 1)
}

// NOTE: combining all the bools into a single opcode doesn't seem to have any performance impact
#[allow(clippy::too_many_arguments)]
pub fn alu(x: u16, y: u16, zx: bool, nx: bool, zy: bool, ny: bool, f: bool, no: bool) -> u16 {
    // zx
    let x1 = mux16(x, 0, zx);
    // nx
    let x2 = mux16(x1, not16(x1), nx);
    // zy
    let y1 = mux16(y, 0, zy);
    // ny
    let y2 = mux16(y1, not16(y1), ny);
    // f
    let out1 = mux16(and16(x2, y2), add16(x2, y2), f);
    // no
    mux16(out1, not16(out1), no)
}
