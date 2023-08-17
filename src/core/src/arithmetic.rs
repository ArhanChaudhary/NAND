fn Add16(a: u16, b: u16) -> u16 {
    let a0 = nBit16_0(a);
    let a1 = nBit16(a, 1);
    let a2 = nBit16(a, 2);
    let a3 = nBit16(a, 3);
    let a4 = nBit16(a, 4);
    let a5 = nBit16(a, 5);
    let a6 = nBit16(a, 6);
    let a7 = nBit16(a, 7);
    let a8 = nBit16(a, 8);
    let a9 = nBit16(a, 9);
    let a10 = nBit16(a, 10);
    let a11 = nBit16(a, 11);
    let a12 = nBit16(a, 12);
    let a13 = nBit16(a, 13);
    let a14 = nBit16(a, 14);
    let a15 = nBit16(a, 15);
    let b0 = nBit16_0(b);
    let b1 = nBit16(b, 1);
    let b2 = nBit16(b, 2);
    let b3 = nBit16(b, 3);
    let b4 = nBit16(b, 4);
    let b5 = nBit16(b, 5);
    let b6 = nBit16(b, 6);
    let b7 = nBit16(b, 7);
    let b8 = nBit16(b, 8);
    let b9 = nBit16(b, 9);
    let b10 = nBit16(b, 10);
    let b11 = nBit16(b, 11);
    let b12 = nBit16(b, 12);
    let b13 = nBit16(b, 13);
    let b14 = nBit16(b, 14);
    let b15 = nBit16(b, 15);
    let carry1 = And(a0, b0);
    let x1 = Xor(b1, carry1);
    let carry2 = Or(And(b1, carry1), And(a1, x1));
    let x2 = Xor(b2, carry2);
    let carry3 = Or(And(b2, carry2), And(a2, x2));
    let x3 = Xor(b3, carry3);
    let carry4 = Or(And(b3, carry3), And(a3, x3));
    let x4 = Xor(b4, carry4);
    let carry5 = Or(And(b4, carry4), And(a4, x4));
    let x5 = Xor(b5, carry5);
    let carry6 = Or(And(b5, carry5), And(a5, x5));
    let x6 = Xor(b6, carry6);
    let carry7 = Or(And(b6, carry6), And(a6, x6));
    let x7 = Xor(b7, carry7);
    let carry8 = Or(And(b7, carry7), And(a7, x7));
    let x8 = Xor(b8, carry8);
    let carry9 = Or(And(b8, carry8), And(a8, x8));
    let x9 = Xor(b9, carry9);
    let carry10 = Or(And(b9, carry9), And(a9, x9));
    let x10 = Xor(b10, carry10);
    let carry11 = Or(And(b10, carry10), And(a10, x10));
    let x11 = Xor(b11, carry11);
    let carry12 = Or(And(b11, carry11), And(a11, x11));
    let x12 = Xor(b12, carry12);
    let carry13 = Or(And(b12, carry12), And(a12, x12));
    let x13 = Xor(b13, carry13);
    let carry14 = Or(And(b13, carry13), And(a13, x13));
    let x14 = Xor(b14, carry14);
    return word16_16(
        Xor(a0, b0),
        Xor(a1, x1),
        Xor(a2, x2),
        Xor(a3, x3),
        Xor(a4, x4),
        Xor(a5, x5),
        Xor(a6, x6),
        Xor(a7, x7),
        Xor(a8, x8),
        Xor(a9, x9),
        Xor(a10, x10),
        Xor(a11, x11),
        Xor(a12, x12),
        Xor(a13, x13),
        Xor(a14, x14),
        Xor(a15, Xor(b15, Or(And(b14, carry14), And(a14, x14)))),
    );
}

pub fn Inc16(in_: u16) -> u16 {
    return Add16(in_, 1);
}

// NOTE: combining all the booleans into a single opcode doesn't seem to have any performance impact
pub fn ALU(x: u16, y: u16, zx: boolean, nx: boolean, zy: boolean, ny: boolean, f: boolean, no: boolean) -> u16 {
    // zx
    let x1 = Mux16(x, 0, zx);
    // nx
    let x2 = Mux16(x1, Not16(x1), nx);
    // zy
    let y1 = Mux16(y, 0, zy);
    // ny
    let y2 = Mux16(y1, Not16(y1), ny);
    // f
    let out1 = Mux16(And16(x2, y2), Add16(x2, y2), f);
    // no
    return Mux16(out1, Not16(out1), no);
}