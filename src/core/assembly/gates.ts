import { NAND, nBit, placeBit } from "./builtins"

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
export function Mux(a: boolean, b: boolean, sel: boolean): boolean {
    return NAND(NAND(a, Not(sel)), NAND(b, sel));
}

// @ts-ignore
@inline
export function DMux(in_: boolean, sel: boolean): i8 {
    return <i8>(placeBit(And(in_, Not(sel)), 1) + placeBit(And(in_, sel), 0));
}


export function Not16(in_: i16): i16 {
    return placeBit(Not(nBit(in_, 15)), 15) +
        placeBit(Not(nBit(in_, 14)), 14) +
        placeBit(Not(nBit(in_, 13)), 13) +
        placeBit(Not(nBit(in_, 12)), 12) +
        placeBit(Not(nBit(in_, 11)), 11) +
        placeBit(Not(nBit(in_, 10)), 10) +
        placeBit(Not(nBit(in_, 9)), 9) +
        placeBit(Not(nBit(in_, 8)), 8) +
        placeBit(Not(nBit(in_, 7)), 7) +
        placeBit(Not(nBit(in_, 6)), 6) +
        placeBit(Not(nBit(in_, 5)), 5) +
        placeBit(Not(nBit(in_, 4)), 4) +
        placeBit(Not(nBit(in_, 3)), 3) +
        placeBit(Not(nBit(in_, 2)), 2) +
        placeBit(Not(nBit(in_, 1)), 1) +
        placeBit(Not(nBit(in_, 0)), 0)
}

export function And16(a: i16, b: i16): i16 {
    return placeBit(And(nBit(a, 15), nBit(b, 15)), 15) +
        placeBit(And(nBit(a, 14), nBit(b, 14)), 14) +
        placeBit(And(nBit(a, 13), nBit(b, 13)), 13) +
        placeBit(And(nBit(a, 12), nBit(b, 12)), 12) +
        placeBit(And(nBit(a, 11), nBit(b, 11)), 11) +
        placeBit(And(nBit(a, 10), nBit(b, 10)), 10) +
        placeBit(And(nBit(a, 9), nBit(b, 9)), 9) +
        placeBit(And(nBit(a, 8), nBit(b, 8)), 8) +
        placeBit(And(nBit(a, 7), nBit(b, 7)), 7) +
        placeBit(And(nBit(a, 6), nBit(b, 6)), 6) +
        placeBit(And(nBit(a, 5), nBit(b, 5)), 5) +
        placeBit(And(nBit(a, 4), nBit(b, 4)), 4) +
        placeBit(And(nBit(a, 3), nBit(b, 3)), 3) +
        placeBit(And(nBit(a, 2), nBit(b, 2)), 2) +
        placeBit(And(nBit(a, 1), nBit(b, 1)), 1) +
        placeBit(And(nBit(a, 0), nBit(b, 0)), 0)
}


// @ts-ignore
@inline
export function Or16(a: i16, b: i16): i16 {
    return placeBit(Or(nBit(a, 15), nBit(b, 15)), 15) +
        placeBit(Or(nBit(a, 14), nBit(b, 14)), 14) +
        placeBit(Or(nBit(a, 13), nBit(b, 13)), 13) +
        placeBit(Or(nBit(a, 12), nBit(b, 12)), 12) +
        placeBit(Or(nBit(a, 11), nBit(b, 11)), 11) +
        placeBit(Or(nBit(a, 10), nBit(b, 10)), 10) +
        placeBit(Or(nBit(a, 9), nBit(b, 9)), 9) +
        placeBit(Or(nBit(a, 8), nBit(b, 8)), 8) +
        placeBit(Or(nBit(a, 7), nBit(b, 7)), 7) +
        placeBit(Or(nBit(a, 6), nBit(b, 6)), 6) +
        placeBit(Or(nBit(a, 5), nBit(b, 5)), 5) +
        placeBit(Or(nBit(a, 4), nBit(b, 4)), 4) +
        placeBit(Or(nBit(a, 3), nBit(b, 3)), 3) +
        placeBit(Or(nBit(a, 2), nBit(b, 2)), 2) +
        placeBit(Or(nBit(a, 1), nBit(b, 1)), 1) +
        placeBit(Or(nBit(a, 0), nBit(b, 0)), 0)
}

// @ts-ignore
@inline
export function Mux16(a: i16, b: i16, sel: boolean): i16 {
    return placeBit(Mux(nBit(a, 15), nBit(b, 15), sel), 15) +
        placeBit(Mux(nBit(a, 14), nBit(b, 14), sel), 14) +
        placeBit(Mux(nBit(a, 13), nBit(b, 13), sel), 13) +
        placeBit(Mux(nBit(a, 12), nBit(b, 12), sel), 12) +
        placeBit(Mux(nBit(a, 11), nBit(b, 11), sel), 11) +
        placeBit(Mux(nBit(a, 10), nBit(b, 10), sel), 10) +
        placeBit(Mux(nBit(a, 9), nBit(b, 9), sel), 9) +
        placeBit(Mux(nBit(a, 8), nBit(b, 8), sel), 8) +
        placeBit(Mux(nBit(a, 7), nBit(b, 7), sel), 7) +
        placeBit(Mux(nBit(a, 6), nBit(b, 6), sel), 6) +
        placeBit(Mux(nBit(a, 5), nBit(b, 5), sel), 5) +
        placeBit(Mux(nBit(a, 4), nBit(b, 4), sel), 4) +
        placeBit(Mux(nBit(a, 3), nBit(b, 3), sel), 3) +
        placeBit(Mux(nBit(a, 2), nBit(b, 2), sel), 2) +
        placeBit(Mux(nBit(a, 1), nBit(b, 1), sel), 1) +
        placeBit(Mux(nBit(a, 0), nBit(b, 0), sel), 0)
}

// @ts-ignore
@inline
export function Or8Way(a: i16): boolean {
    return Or(
        nBit(a, 7),
        Or(
            nBit(a, 6),
            Or(
                nBit(a, 5),
                Or(
                    nBit(a, 4),
                    Or(
                        nBit(a, 3),
                        Or(
                            nBit(a, 2),
                            Or(nBit(a, 1), nBit(a, 0))
                        )
                    )
                )
            )
        )
    );
}

// @ts-ignore
@inline
export function Mux4Way16(a: i16, b: i16, c: i16, d: i16, sel: u8): i16 {
    const lsb = nBit(sel, 0);
    return Mux16(
        Mux16(a, b, lsb),
        Mux16(c, d, lsb),
        nBit(sel, 1)
    );
}


// @ts-ignore
@inline
export function Mux8Way16(a: i16, b: i16, c: i16, d: i16, e: i16, f: i16, g: i16, h: i16, sel: u8): i16 {
    const s0 = nBit(sel, 0);
    const s1 = nBit(sel, 1);
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
        nBit(sel, 2)
    );
}


// @ts-ignore
@inline
export function DMux4Way(in_: boolean, sel: u8): i8 {
    const lsb = nBit(sel, 0);
    const msb = nBit(sel, 1);
    const DMuxInline0 = And(in_, Not(msb));
    const DMuxInline1 = And(in_, msb);
    return <i8>(placeBit(And(DMuxInline0, Not(lsb)), 3) +
        placeBit(And(DMuxInline0, lsb), 2) +
        placeBit(And(DMuxInline1, Not(lsb)), 1) +
        placeBit(And(DMuxInline1, lsb), 0))
}

// @ts-ignore
@inline
export function DMux8Way(in_: boolean, sel: u8): i8 {
    const s0 = nBit(sel, 0);
    const s1 = nBit(sel, 1);
    const s2 = nBit(sel, 2);
    const nots1 = Not(s1);
    const nots2 = Not(s0);
    const topbottom0 = And(in_, Not(s2));
    const topbottom1 = And(in_, s2);
    const DMuxInline0 = And(topbottom0, nots1);
    const DMuxInline1 = And(topbottom0, s1);
    const DMuxInline2 = And(topbottom1, nots1);
    const DMuxInline3 = And(topbottom1, s1);
    return <i8>(
        placeBit(And(DMuxInline0, nots2), 7) +
        placeBit(And(DMuxInline0, s0), 6) +
        placeBit(And(DMuxInline1, nots2), 5) +
        placeBit(And(DMuxInline1, s0), 4) +
        placeBit(And(DMuxInline2, nots2), 3) +
        placeBit(And(DMuxInline2, s0), 2) +
        placeBit(And(DMuxInline3, nots2), 1) +
        placeBit(And(DMuxInline3, s0), 0)
    );
}