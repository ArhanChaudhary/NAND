import { NAND, nBit16, nBit16_0, nBit32, nBit32_0, placeBit16, placeBit16_0 } from "./builtins"

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
    return <i8>(placeBit16(And(in_, Not(sel)), 1) + placeBit16_0(And(in_, sel)));
}

// @ts-ignore
@inline
export function Not16(in_: i16): i16 {
    return placeBit16(Not(nBit16(in_, 15)), 15) +
        placeBit16(Not(nBit16(in_, 14)), 14) +
        placeBit16(Not(nBit16(in_, 13)), 13) +
        placeBit16(Not(nBit16(in_, 12)), 12) +
        placeBit16(Not(nBit16(in_, 11)), 11) +
        placeBit16(Not(nBit16(in_, 10)), 10) +
        placeBit16(Not(nBit16(in_, 9)), 9) +
        placeBit16(Not(nBit16(in_, 8)), 8) +
        placeBit16(Not(nBit16(in_, 7)), 7) +
        placeBit16(Not(nBit16(in_, 6)), 6) +
        placeBit16(Not(nBit16(in_, 5)), 5) +
        placeBit16(Not(nBit16(in_, 4)), 4) +
        placeBit16(Not(nBit16(in_, 3)), 3) +
        placeBit16(Not(nBit16(in_, 2)), 2) +
        placeBit16(Not(nBit16(in_, 1)), 1) +
        placeBit16_0(Not(nBit16_0(in_)))
}

// @ts-ignore
@inline
export function And16(ab: i32): i16 {
    return placeBit16(And(nBit32(ab, 15), nBit32(ab, 31)), 15) +
        placeBit16(And(nBit32(ab, 14), nBit32(ab, 30)), 14) +
        placeBit16(And(nBit32(ab, 13), nBit32(ab, 29)), 13) +
        placeBit16(And(nBit32(ab, 12), nBit32(ab, 28)), 12) +
        placeBit16(And(nBit32(ab, 11), nBit32(ab, 27)), 11) +
        placeBit16(And(nBit32(ab, 10), nBit32(ab, 26)), 10) +
        placeBit16(And(nBit32(ab, 9), nBit32(ab, 25)), 9) +
        placeBit16(And(nBit32(ab, 8), nBit32(ab, 24)), 8) +
        placeBit16(And(nBit32(ab, 7), nBit32(ab, 23)), 7) +
        placeBit16(And(nBit32(ab, 6), nBit32(ab, 22)), 6) +
        placeBit16(And(nBit32(ab, 5), nBit32(ab, 21)), 5) +
        placeBit16(And(nBit32(ab, 4), nBit32(ab, 20)), 4) +
        placeBit16(And(nBit32(ab, 3), nBit32(ab, 19)), 3) +
        placeBit16(And(nBit32(ab, 2), nBit32(ab, 18)), 2) +
        placeBit16(And(nBit32(ab, 1), nBit32(ab, 17)), 1) +
        placeBit16_0(And(nBit32_0(ab), nBit32(ab, 16)))
}


// @ts-ignore
@inline
export function Or16(ab: i32): i16 {
    return placeBit16(Or(nBit32(ab, 15), nBit32(ab, 31)), 15) +
        placeBit16(Or(nBit32(ab, 14), nBit32(ab, 30)), 14) +
        placeBit16(Or(nBit32(ab, 13), nBit32(ab, 29)), 13) +
        placeBit16(Or(nBit32(ab, 12), nBit32(ab, 28)), 12) +
        placeBit16(Or(nBit32(ab, 11), nBit32(ab, 27)), 11) +
        placeBit16(Or(nBit32(ab, 10), nBit32(ab, 26)), 10) +
        placeBit16(Or(nBit32(ab, 9), nBit32(ab, 25)), 9) +
        placeBit16(Or(nBit32(ab, 8), nBit32(ab, 24)), 8) +
        placeBit16(Or(nBit32(ab, 7), nBit32(ab, 23)), 7) +
        placeBit16(Or(nBit32(ab, 6), nBit32(ab, 22)), 6) +
        placeBit16(Or(nBit32(ab, 5), nBit32(ab, 21)), 5) +
        placeBit16(Or(nBit32(ab, 4), nBit32(ab, 20)), 4) +
        placeBit16(Or(nBit32(ab, 3), nBit32(ab, 19)), 3) +
        placeBit16(Or(nBit32(ab, 2), nBit32(ab, 18)), 2) +
        placeBit16(Or(nBit32(ab, 1), nBit32(ab, 17)), 1) +
        placeBit16(Or(nBit32_0(ab), nBit32(ab, 16)), 0)
}

// @ts-ignore
@inline
export function Mux16(a: i16, b: i16, sel: boolean): i16 {
    return placeBit16(Mux(nBit16(a, 15), nBit16(b, 15), sel), 15) +
        placeBit16(Mux(nBit16(a, 14), nBit16(b, 14), sel), 14) +
        placeBit16(Mux(nBit16(a, 13), nBit16(b, 13), sel), 13) +
        placeBit16(Mux(nBit16(a, 12), nBit16(b, 12), sel), 12) +
        placeBit16(Mux(nBit16(a, 11), nBit16(b, 11), sel), 11) +
        placeBit16(Mux(nBit16(a, 10), nBit16(b, 10), sel), 10) +
        placeBit16(Mux(nBit16(a, 9), nBit16(b, 9), sel), 9) +
        placeBit16(Mux(nBit16(a, 8), nBit16(b, 8), sel), 8) +
        placeBit16(Mux(nBit16(a, 7), nBit16(b, 7), sel), 7) +
        placeBit16(Mux(nBit16(a, 6), nBit16(b, 6), sel), 6) +
        placeBit16(Mux(nBit16(a, 5), nBit16(b, 5), sel), 5) +
        placeBit16(Mux(nBit16(a, 4), nBit16(b, 4), sel), 4) +
        placeBit16(Mux(nBit16(a, 3), nBit16(b, 3), sel), 3) +
        placeBit16(Mux(nBit16(a, 2), nBit16(b, 2), sel), 2) +
        placeBit16(Mux(nBit16(a, 1), nBit16(b, 1), sel), 1) +
        placeBit16_0(Mux(nBit16_0(a), nBit16_0(b), sel))
}

// @ts-ignore
@inline
export function Or8Way(a: i8): boolean {
    return Or(
        nBit16(a, 7),
        Or(
            nBit16(a, 6),
            Or(
                nBit16(a, 5),
                Or(
                    nBit16(a, 4),
                    Or(
                        nBit16(a, 3),
                        Or(
                            nBit16(a, 2),
                            Or(nBit16(a, 1), nBit16_0(a))
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
    const lsb = nBit16_0(sel);
    return Mux16(
        Mux16(a, b, lsb),
        Mux16(c, d, lsb),
        nBit16(sel, 1)
    );
}


// @ts-ignore
@inline
export function Mux8Way16(a: i16, b: i16, c: i16, d: i16, e: i16, f: i16, g: i16, h: i16, sel: u8): i16 {
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
export function DMux4Way(in_: boolean, sel: u8): i8 {
    const lsb = nBit16_0(sel);
    const msb = nBit16(sel, 1);
    const DMuxInline0 = And(in_, Not(msb));
    const DMuxInline1 = And(in_, msb);
    return <i8>(
        placeBit16(And(DMuxInline0, Not(lsb)), 3) +
        placeBit16(And(DMuxInline0, lsb), 2) +
        placeBit16(And(DMuxInline1, Not(lsb)), 1) +
        placeBit16_0(And(DMuxInline1, lsb))
    )
}

// @ts-ignore
@inline
export function DMux8Way(in_: boolean, sel: u8): i8 {
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
    return <i8>(
        placeBit16(And(DMuxInline0, nots2), 7) +
        placeBit16(And(DMuxInline0, s0), 6) +
        placeBit16(And(DMuxInline1, nots2), 5) +
        placeBit16(And(DMuxInline1, s0), 4) +
        placeBit16(And(DMuxInline2, nots2), 3) +
        placeBit16(And(DMuxInline2, s0), 2) +
        placeBit16(And(DMuxInline3, nots2), 1) +
        placeBit16_0(And(DMuxInline3, s0))
    );
}