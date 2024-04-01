use crate::builtins::hardware;
use crate::builtins::utils::bit_manipulation::{nbit16, word16_16};

pub fn not(a: bool) -> bool {
    hardware::NAND(a, a)
}

pub fn and(a: bool, b: bool) -> bool {
    not(hardware::NAND(a, b))
}

pub fn or(a: bool, b: bool) -> bool {
    hardware::NAND(not(a), not(b))
}

fn mux(a: bool, b: bool, sel: bool) -> bool {
    hardware::NAND(hardware::NAND(a, not(sel)), hardware::NAND(b, sel))
}

pub fn not16(a: u16) -> u16 {
    word16_16(
        not(nbit16(a, 0)),
        not(nbit16(a, 1)),
        not(nbit16(a, 2)),
        not(nbit16(a, 3)),
        not(nbit16(a, 4)),
        not(nbit16(a, 5)),
        not(nbit16(a, 6)),
        not(nbit16(a, 7)),
        not(nbit16(a, 8)),
        not(nbit16(a, 9)),
        not(nbit16(a, 10)),
        not(nbit16(a, 11)),
        not(nbit16(a, 12)),
        not(nbit16(a, 13)),
        not(nbit16(a, 14)),
        not(nbit16(a, 15)),
    )
}

pub fn and16(a: u16, b: u16) -> u16 {
    word16_16(
        and(nbit16(a, 0), nbit16(b, 0)),
        and(nbit16(a, 1), nbit16(b, 1)),
        and(nbit16(a, 2), nbit16(b, 2)),
        and(nbit16(a, 3), nbit16(b, 3)),
        and(nbit16(a, 4), nbit16(b, 4)),
        and(nbit16(a, 5), nbit16(b, 5)),
        and(nbit16(a, 6), nbit16(b, 6)),
        and(nbit16(a, 7), nbit16(b, 7)),
        and(nbit16(a, 8), nbit16(b, 8)),
        and(nbit16(a, 9), nbit16(b, 9)),
        and(nbit16(a, 10), nbit16(b, 10)),
        and(nbit16(a, 11), nbit16(b, 11)),
        and(nbit16(a, 12), nbit16(b, 12)),
        and(nbit16(a, 13), nbit16(b, 13)),
        and(nbit16(a, 14), nbit16(b, 14)),
        and(nbit16(a, 15), nbit16(b, 15)),
    )
}

pub fn mux16(a: u16, b: u16, sel: bool) -> u16 {
    word16_16(
        mux(nbit16(a, 0), nbit16(b, 0), sel),
        mux(nbit16(a, 1), nbit16(b, 1), sel),
        mux(nbit16(a, 2), nbit16(b, 2), sel),
        mux(nbit16(a, 3), nbit16(b, 3), sel),
        mux(nbit16(a, 4), nbit16(b, 4), sel),
        mux(nbit16(a, 5), nbit16(b, 5), sel),
        mux(nbit16(a, 6), nbit16(b, 6), sel),
        mux(nbit16(a, 7), nbit16(b, 7), sel),
        mux(nbit16(a, 8), nbit16(b, 8), sel),
        mux(nbit16(a, 9), nbit16(b, 9), sel),
        mux(nbit16(a, 10), nbit16(b, 10), sel),
        mux(nbit16(a, 11), nbit16(b, 11), sel),
        mux(nbit16(a, 12), nbit16(b, 12), sel),
        mux(nbit16(a, 13), nbit16(b, 13), sel),
        mux(nbit16(a, 14), nbit16(b, 14), sel),
        mux(nbit16(a, 15), nbit16(b, 15), sel),
    )
}

pub fn is_zero(a: u16) -> bool {
    not(or(
        nbit16(a, 15),
        or(
            nbit16(a, 14),
            or(
                nbit16(a, 13),
                or(
                    nbit16(a, 12),
                    or(
                        nbit16(a, 11),
                        or(
                            nbit16(a, 10),
                            or(
                                nbit16(a, 9),
                                or(
                                    nbit16(a, 8),
                                    or(
                                        nbit16(a, 7),
                                        or(
                                            nbit16(a, 6),
                                            or(
                                                nbit16(a, 5),
                                                or(
                                                    nbit16(a, 4),
                                                    or(
                                                        nbit16(a, 3),
                                                        or(
                                                            nbit16(a, 2),
                                                            or(nbit16(a, 1), nbit16(a, 0)),
                                                        ),
                                                    ),
                                                ),
                                            ),
                                        ),
                                    ),
                                ),
                            ),
                        ),
                    ),
                ),
            ),
        ),
    ))
}
