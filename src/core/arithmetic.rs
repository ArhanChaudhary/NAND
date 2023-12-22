use crate::{
    gates::{and, and16, mux16, not16, or, xor},
    nbit16, nbit16_0, word16_16,
};

fn add16(a: u16, b: u16) -> u16 {
    let a0 = nbit16_0(a);
    let a1 = nbit16(a, 1);
    let a2 = nbit16(a, 2);
    let a3 = nbit16(a, 3);
    let a4 = nbit16(a, 4);
    let a5 = nbit16(a, 5);
    let a6 = nbit16(a, 6);
    let a7 = nbit16(a, 7);
    let a8 = nbit16(a, 8);
    let a9 = nbit16(a, 9);
    let a10 = nbit16(a, 10);
    let a11 = nbit16(a, 11);
    let a12 = nbit16(a, 12);
    let a13 = nbit16(a, 13);
    let a14 = nbit16(a, 14);
    let a15 = nbit16(a, 15);
    let b0 = nbit16_0(b);
    let b1 = nbit16(b, 1);
    let b2 = nbit16(b, 2);
    let b3 = nbit16(b, 3);
    let b4 = nbit16(b, 4);
    let b5 = nbit16(b, 5);
    let b6 = nbit16(b, 6);
    let b7 = nbit16(b, 7);
    let b8 = nbit16(b, 8);
    let b9 = nbit16(b, 9);
    let b10 = nbit16(b, 10);
    let b11 = nbit16(b, 11);
    let b12 = nbit16(b, 12);
    let b13 = nbit16(b, 13);
    let b14 = nbit16(b, 14);
    let b15 = nbit16(b, 15);
    let carry1 = and(a0, b0);
    let x1 = xor(b1, carry1);
    let carry2 = or(and(b1, carry1), and(a1, x1));
    let x2 = xor(b2, carry2);
    let carry3 = or(and(b2, carry2), and(a2, x2));
    let x3 = xor(b3, carry3);
    let carry4 = or(and(b3, carry3), and(a3, x3));
    let x4 = xor(b4, carry4);
    let carry5 = or(and(b4, carry4), and(a4, x4));
    let x5 = xor(b5, carry5);
    let carry6 = or(and(b5, carry5), and(a5, x5));
    let x6 = xor(b6, carry6);
    let carry7 = or(and(b6, carry6), and(a6, x6));
    let x7 = xor(b7, carry7);
    let carry8 = or(and(b7, carry7), and(a7, x7));
    let x8 = xor(b8, carry8);
    let carry9 = or(and(b8, carry8), and(a8, x8));
    let x9 = xor(b9, carry9);
    let carry10 = or(and(b9, carry9), and(a9, x9));
    let x10 = xor(b10, carry10);
    let carry11 = or(and(b10, carry10), and(a10, x10));
    let x11 = xor(b11, carry11);
    let carry12 = or(and(b11, carry11), and(a11, x11));
    let x12 = xor(b12, carry12);
    let carry13 = or(and(b12, carry12), and(a12, x12));
    let x13 = xor(b13, carry13);
    let carry14 = or(and(b13, carry13), and(a13, x13));
    let x14 = xor(b14, carry14);
    word16_16(
        xor(a0, b0),
        xor(a1, x1),
        xor(a2, x2),
        xor(a3, x3),
        xor(a4, x4),
        xor(a5, x5),
        xor(a6, x6),
        xor(a7, x7),
        xor(a8, x8),
        xor(a9, x9),
        xor(a10, x10),
        xor(a11, x11),
        xor(a12, x12),
        xor(a13, x13),
        xor(a14, x14),
        xor(a15, xor(b15, or(and(b14, carry14), and(a14, x14)))),
    )
}

pub fn inc16(in_: u16) -> u16 {
    add16(in_, 1)
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
