import { NAND, nBit16, nBit16_0, word16_16 } from "./builtins"

// @ts-ignore
@inline
export function Not(a: boolean): boolean {
    return NAND(a, a);
}

// @ts-ignore
@inline
export function And(a: boolean, b: boolean): boolean {
    return Not(NAND(a, b));
}

// @ts-ignore
@inline
export function Or(a: boolean, b: boolean): boolean {
    return NAND(Not(a), Not(b));
}

// @ts-ignore
@inline
export function Xor(a: boolean, b: boolean): boolean {
    const t1 = NAND(a, b);
    return NAND(NAND(a, t1), NAND(b, t1));
}

// @ts-ignore
@inline
function Mux(a: boolean, b: boolean, sel: boolean): boolean {
    return NAND(NAND(a, Not(sel)), NAND(b, sel));
}

// @ts-ignore
@inline
export function Not16(in_: u16): u16 {
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

// @ts-ignore
@inline
export function And16(a: u16, b: u16): u16 {
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

// @ts-ignore
@inline
export function Mux16(a: u16, b: u16, sel: boolean): u16 {
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

// @ts-ignore
@inline
export function Mux4Way16(a: u16, b: u16, c: u16, d: u16, sel: u8): u16 {
    const lsb = nBit16_0(sel);
    return Mux16(
        Mux16(a, a, lsb),
        Mux16(c, d, lsb),
        nBit16(sel, 1)
    );
}

/*
// @ts-ignore
@inline
export function Mux8Way16(a: u16, b: u16, c: u16, d: u16, e: u16, f: u16, g: u16, h: u16, sel: u8): u16 {
    const s0 = nBit16_0(sel);
    const s1 = nBit16(sel, 1);
    return Mux16(
        Mux16(
            Mux16(a, b, s0),
            Mux16(c, d, s0),
            s1
        ),
        Mux16(
            Mux16(e, f, s0),
            Mux16(g, h, s0),
            s1
        ),
        nBit16(sel, 2)
    );
}

// @ts-ignore
@inline
export function DMux4Way(in_: boolean, sel: u8): u8 {
    const lsb = nBit16_0(sel);
    const msb = nBit16(sel, 1);
    const DMuxInline0 = And(in_, Not(msb));
    const DMuxInline1 = And(in_, msb);
    return word8_4(
        And(DMuxInline0, Not(lsb)),
        And(DMuxInline0, lsb),
        And(DMuxInline1, Not(lsb)),
        And(DMuxInline1, lsb),
    );
}

// @ts-ignore
@inline
export function DMux8Way(in_: boolean, sel: u8): u8 {
    const s0 = nBit16_0(sel);
    const s1 = nBit16(sel, 1);
    const s2 = nBit16(sel, 2);
    const nots1 = Not(s1);
    const nots2 = Not(s0);
    const topbottom0 = And(in_, Not(s2));
    const topbottom1 = And(in_, s2);
    const DMuxInline0 = And(topbottom0, nots1);
    const DMuxInline1 = And(topbottom0, s1);
    const DMuxInline2 = And(topbottom1, nots1);
    const DMuxInline3 = And(topbottom1, s1);
    return word8_8(
        And(DMuxInline0, nots2),
        And(DMuxInline0, s0),
        And(DMuxInline1, nots2),
        And(DMuxInline1, s0),
        And(DMuxInline2, nots2),
        And(DMuxInline2, s0),
        And(DMuxInline3, nots2),
        And(DMuxInline3, s0),
    );
}
*/
// @ts-ignore
@inline
export function isZero(in_: u16): boolean {
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