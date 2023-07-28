import { NAND } from "./builtins"

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
export function DMux(in_: boolean, sel: boolean): StaticArray<boolean> {
    return [And(in_, Not(sel)), And(in_, sel)];
}

// @ts-ignore
@inline
export function Not16(in_: StaticArray<boolean>): StaticArray<boolean> {
    return [
        Not(in_[0]),
        Not(in_[1]),
        Not(in_[2]),
        Not(in_[3]),
        Not(in_[4]),
        Not(in_[5]),
        Not(in_[6]),
        Not(in_[7]),
        Not(in_[8]),
        Not(in_[9]),
        Not(in_[10]),
        Not(in_[11]),
        Not(in_[12]),
        Not(in_[13]),
        Not(in_[14]),
        Not(in_[15]),
    ];
}

// @ts-ignore
@inline
export function And16(a: StaticArray<boolean>, b: StaticArray<boolean>): StaticArray<boolean> {
    return [
        And(a[0], b[0]),
        And(a[1], b[1]),
        And(a[2], b[2]),
        And(a[3], b[3]),
        And(a[4], b[4]),
        And(a[5], b[5]),
        And(a[6], b[6]),
        And(a[7], b[7]),
        And(a[8], b[8]),
        And(a[9], b[9]),
        And(a[10], b[10]),
        And(a[11], b[11]),
        And(a[12], b[12]),
        And(a[13], b[13]),
        And(a[14], b[14]),
        And(a[15], b[15]),
    ];
}

// @ts-ignore
@inline
export function Or16(a: StaticArray<boolean>, b: StaticArray<boolean>): StaticArray<boolean> {
    return [
        Or(a[0], b[0]),
        Or(a[1], b[1]),
        Or(a[2], b[2]),
        Or(a[3], b[3]),
        Or(a[4], b[4]),
        Or(a[5], b[5]),
        Or(a[6], b[6]),
        Or(a[7], b[7]),
        Or(a[8], b[8]),
        Or(a[9], b[9]),
        Or(a[10], b[10]),
        Or(a[11], b[11]),
        Or(a[12], b[12]),
        Or(a[13], b[13]),
        Or(a[14], b[14]),
        Or(a[15], b[15]),
    ];
}

// @ts-ignore
@inline
export function Mux16(a: StaticArray<boolean>, b: StaticArray<boolean>, sel: boolean): StaticArray<boolean> {
    return [
        Mux(a[0], b[0], sel),
        Mux(a[1], b[1], sel),
        Mux(a[2], b[2], sel),
        Mux(a[3], b[3], sel),
        Mux(a[4], b[4], sel),
        Mux(a[5], b[5], sel),
        Mux(a[6], b[6], sel),
        Mux(a[7], b[7], sel),
        Mux(a[8], b[8], sel),
        Mux(a[9], b[9], sel),
        Mux(a[10], b[10], sel),
        Mux(a[11], b[11], sel),
        Mux(a[12], b[12], sel),
        Mux(a[13], b[13], sel),
        Mux(a[14], b[14], sel),
        Mux(a[15], b[15], sel),
    ];
}

// @ts-ignore
@inline
export function Or8Way(a: StaticArray<boolean>): boolean {
    return Or(
        a[7],
        Or(
            a[6],
            Or(
                a[5],
                Or(
                    a[4],
                    Or(
                        a[3],
                        Or(
                            a[2],
                            Or(a[1], a[0])
                        )
                    )
                )
            )
        )
    );
}

// @ts-ignore
@inline
export function Mux4Way16(a: StaticArray<boolean>, b: StaticArray<boolean>, c: StaticArray<boolean>, d: StaticArray<boolean>, sel: StaticArray<boolean>): StaticArray<boolean> {
    const lsb = sel[1];
    return Mux16(
        Mux16(a, b, lsb),
        Mux16(c, d, lsb),
        sel[0]
    );
}

// @ts-ignore
@inline
export function Mux8Way16(a: StaticArray<boolean>, b: StaticArray<boolean>, c: StaticArray<boolean>, d: StaticArray<boolean>, e: StaticArray<boolean>, f: StaticArray<boolean>, g: StaticArray<boolean>, h: StaticArray<boolean>, sel: StaticArray<boolean>): StaticArray<boolean> {
    const sliced = sel.slice<StaticArray<boolean>>(1);
    return Mux16(
        Mux4Way16(a, b, c, d, sliced),
        Mux4Way16(e, f, g, h, sliced),
        sel[0]
    );
}

// @ts-ignore
@inline
export function DMux4Way(in_: boolean, sel: StaticArray<boolean>): StaticArray<boolean> {
    const msb = sel[0];
    const lsb = sel[1];
    const DMuxInline0 = And(in_, Not(msb));
    const DMuxInline1 = And(in_, msb);
    return [
        And(DMuxInline0, Not(lsb)),
        And(DMuxInline0, lsb),
        And(DMuxInline1, Not(lsb)),
        And(DMuxInline1, lsb),
    ];
}

// @ts-ignore
@inline
export function DMux8Way(in_: boolean, sel: StaticArray<boolean>): StaticArray<boolean> {
    const s0 = sel[0];
    const s1 = sel[1];
    const s2 = sel[2];
    const nots1 = Not(s1);
    const nots2 = Not(s2);
    const topbottom0 = And(in_, Not(s0));
    const topbottom1 = And(in_, s0);
    const DMuxInline0 = And(topbottom0, nots1);
    const DMuxInline1 = And(topbottom0, s1);
    const DMuxInline2 = And(topbottom1, nots1);
    const DMuxInline3 = And(topbottom1, s1);
    return [
        And(DMuxInline0, nots2),
        And(DMuxInline0, s2),
        And(DMuxInline1, nots2),
        And(DMuxInline1, s2),
        And(DMuxInline2, nots2),
        And(DMuxInline2, s2),
        And(DMuxInline3, nots2),
        And(DMuxInline3, s2),
    ];    
}