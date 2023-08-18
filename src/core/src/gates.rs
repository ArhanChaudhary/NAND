use crate::{nand, n_bit16, n_bit16_0, word16_16};

pub fn not(a: bool) -> bool {
    nand(a, a)
}

pub fn and(a: bool, b: bool) -> bool {
    not(nand(a, b))
}

pub fn or(a: bool, b: bool) -> bool {
    nand(not(a), not(b))
}

pub fn xor(a: bool, b: bool) -> bool {
    let t1 = nand(a, b);
    nand(nand(a, t1), nand(b, t1))
}

fn mux(a: bool, b: bool, sel: bool) -> bool {
    nand(nand(a, not(sel)), nand(b, sel))
}

pub fn not16(in_: u16) -> u16 {
    return word16_16(
        not(n_bit16_0(in_)),
        not(n_bit16(in_, 1)),
        not(n_bit16(in_, 2)),
        not(n_bit16(in_, 3)),
        not(n_bit16(in_, 4)),
        not(n_bit16(in_, 5)),
        not(n_bit16(in_, 6)),
        not(n_bit16(in_, 7)),
        not(n_bit16(in_, 8)),
        not(n_bit16(in_, 9)),
        not(n_bit16(in_, 10)),
        not(n_bit16(in_, 11)),
        not(n_bit16(in_, 12)),
        not(n_bit16(in_, 13)),
        not(n_bit16(in_, 14)),
        not(n_bit16(in_, 15)),
    );
}

pub fn and16(a: u16, b: u16) -> u16 {
    return word16_16(
        and(n_bit16_0(a), n_bit16_0(b)),
        and(n_bit16(a, 1), n_bit16(b, 1)),
        and(n_bit16(a, 2), n_bit16(b, 2)),
        and(n_bit16(a, 3), n_bit16(b, 3)),
        and(n_bit16(a, 4), n_bit16(b, 4)),
        and(n_bit16(a, 5), n_bit16(b, 5)),
        and(n_bit16(a, 6), n_bit16(b, 6)),
        and(n_bit16(a, 7), n_bit16(b, 7)),
        and(n_bit16(a, 8), n_bit16(b, 8)),
        and(n_bit16(a, 9), n_bit16(b, 9)),
        and(n_bit16(a, 10), n_bit16(b, 10)),
        and(n_bit16(a, 11), n_bit16(b, 11)),
        and(n_bit16(a, 12), n_bit16(b, 12)),
        and(n_bit16(a, 13), n_bit16(b, 13)),
        and(n_bit16(a, 14), n_bit16(b, 14)),
        and(n_bit16(a, 15), n_bit16(b, 15))
    );
}

pub fn mux16(a: u16, b: u16, sel: bool) -> u16 {
    return word16_16(
        mux(n_bit16_0(a), n_bit16_0(b), sel),
        mux(n_bit16(a, 1), n_bit16(b, 1), sel),
        mux(n_bit16(a, 2), n_bit16(b, 2), sel),
        mux(n_bit16(a, 3), n_bit16(b, 3), sel),
        mux(n_bit16(a, 4), n_bit16(b, 4), sel),
        mux(n_bit16(a, 5), n_bit16(b, 5), sel),
        mux(n_bit16(a, 6), n_bit16(b, 6), sel),
        mux(n_bit16(a, 7), n_bit16(b, 7), sel),
        mux(n_bit16(a, 8), n_bit16(b, 8), sel),
        mux(n_bit16(a, 9), n_bit16(b, 9), sel),
        mux(n_bit16(a, 10), n_bit16(b, 10), sel),
        mux(n_bit16(a, 11), n_bit16(b, 11), sel),
        mux(n_bit16(a, 12), n_bit16(b, 12), sel),
        mux(n_bit16(a, 13), n_bit16(b, 13), sel),
        mux(n_bit16(a, 14), n_bit16(b, 14), sel),
        mux(n_bit16(a, 15), n_bit16(b, 15), sel)
    );
}

pub fn mux3_way16(ab: u16, c: u16, d: u16, sel: u16) -> u16 {
    return mux16(
        ab,
        mux16(c, d, n_bit16_0(sel)),
        n_bit16(sel, 1)
    );
}

pub fn is_zero(in_: u16) -> bool {
    return not(
        or(
            n_bit16(in_, 15),
            or(
                n_bit16(in_, 14),
                or(
                    n_bit16(in_, 13),
                    or(
                        n_bit16(in_, 12),
                        or(
                            n_bit16(in_, 11),
                            or(
                                n_bit16(in_, 10),
                                or(
                                    n_bit16(in_, 9),
                                    or(
                                        n_bit16(in_, 8),
                                        or(
                                            n_bit16(in_, 7),
                                            or(
                                                n_bit16(in_, 6),
                                                or(
                                                    n_bit16(in_, 5),
                                                    or(
                                                        n_bit16(in_, 4),
                                                        or(
                                                            n_bit16(in_, 3),
                                                            or(
                                                                n_bit16(in_, 2),
                                                                or(n_bit16(in_, 1), n_bit16_0(in_))
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