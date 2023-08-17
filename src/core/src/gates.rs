use crate::{NAND, nBit16, nBit16_0, word16_16};

pub fn Not(a: bool) -> bool {
    NAND(a, a)
}

pub fn And(a: bool, b: bool) -> bool {
    Not(NAND(a, b))
}

pub fn Or(a: bool, b: bool) -> bool {
    NAND(Not(a), Not(b))
}

pub fn Xor(a: bool, b: bool) -> bool {
    let t1 = NAND(a, b);
    NAND(NAND(a, t1), NAND(b, t1))
}

fn Mux(a: bool, b: bool, sel: bool) -> bool {
    NAND(NAND(a, Not(sel)), NAND(b, sel))
}

pub fn Not16(in_: u16) -> u16 {
    return word16_16(
        Not(nBit16_0(in_)),
        Not(nBit16(in_, 1)),
        Not(nBit16(in_, 2)),
        Not(nBit16(in_, 3)),
        Not(nBit16(in_, 4)),
        Not(nBit16(in_, 5)),
        Not(nBit16(in_, 6)),
        Not(nBit16(in_, 7)),
        Not(nBit16(in_, 8)),
        Not(nBit16(in_, 9)),
        Not(nBit16(in_, 10)),
        Not(nBit16(in_, 11)),
        Not(nBit16(in_, 12)),
        Not(nBit16(in_, 13)),
        Not(nBit16(in_, 14)),
        Not(nBit16(in_, 15)),
    );
}

pub fn And16(a: u16, b: u16) -> u16 {
    return word16_16(
        And(nBit16_0(a), nBit16_0(b)),
        And(nBit16(a, 1), nBit16(b, 1)),
        And(nBit16(a, 2), nBit16(b, 2)),
        And(nBit16(a, 3), nBit16(b, 3)),
        And(nBit16(a, 4), nBit16(b, 4)),
        And(nBit16(a, 5), nBit16(b, 5)),
        And(nBit16(a, 6), nBit16(b, 6)),
        And(nBit16(a, 7), nBit16(b, 7)),
        And(nBit16(a, 8), nBit16(b, 8)),
        And(nBit16(a, 9), nBit16(b, 9)),
        And(nBit16(a, 10), nBit16(b, 10)),
        And(nBit16(a, 11), nBit16(b, 11)),
        And(nBit16(a, 12), nBit16(b, 12)),
        And(nBit16(a, 13), nBit16(b, 13)),
        And(nBit16(a, 14), nBit16(b, 14)),
        And(nBit16(a, 15), nBit16(b, 15))
    );
}

pub fn Mux16(a: u16, b: u16, sel: bool) -> u16 {
    return word16_16(
        Mux(nBit16_0(a), nBit16_0(b), sel),
        Mux(nBit16(a, 1), nBit16(b, 1), sel),
        Mux(nBit16(a, 2), nBit16(b, 2), sel),
        Mux(nBit16(a, 3), nBit16(b, 3), sel),
        Mux(nBit16(a, 4), nBit16(b, 4), sel),
        Mux(nBit16(a, 5), nBit16(b, 5), sel),
        Mux(nBit16(a, 6), nBit16(b, 6), sel),
        Mux(nBit16(a, 7), nBit16(b, 7), sel),
        Mux(nBit16(a, 8), nBit16(b, 8), sel),
        Mux(nBit16(a, 9), nBit16(b, 9), sel),
        Mux(nBit16(a, 10), nBit16(b, 10), sel),
        Mux(nBit16(a, 11), nBit16(b, 11), sel),
        Mux(nBit16(a, 12), nBit16(b, 12), sel),
        Mux(nBit16(a, 13), nBit16(b, 13), sel),
        Mux(nBit16(a, 14), nBit16(b, 14), sel),
        Mux(nBit16(a, 15), nBit16(b, 15), sel)
    );
}

pub fn Mux3Way16(ab: u16, c: u16, d: u16, sel: u16) -> u16 {
    return Mux16(
        ab,
        Mux16(c, d, nBit16_0(sel)),
        nBit16(sel, 1)
    );
}

pub fn isZero(in_: u16) -> bool {
    return Not(
        Or(
            nBit16(in_, 15),
            Or(
                nBit16(in_, 14),
                Or(
                    nBit16(in_, 13),
                    Or(
                        nBit16(in_, 12),
                        Or(
                            nBit16(in_, 11),
                            Or(
                                nBit16(in_, 10),
                                Or(
                                    nBit16(in_, 9),
                                    Or(
                                        nBit16(in_, 8),
                                        Or(
                                            nBit16(in_, 7),
                                            Or(
                                                nBit16(in_, 6),
                                                Or(
                                                    nBit16(in_, 5),
                                                    Or(
                                                        nBit16(in_, 4),
                                                        Or(
                                                            nBit16(in_, 3),
                                                            Or(
                                                                nBit16(in_, 2),
                                                                Or(nBit16(in_, 1), nBit16_0(in_))
                                                            )
                                                        )
                                                    )
                                                )
                                            )
                                        )
                                    )
                                )
                            )
                        )
                    )
                )
            )
        )
    );
}