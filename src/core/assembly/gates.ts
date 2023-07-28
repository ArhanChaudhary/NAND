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

export function Not16(in_: StaticArray<boolean>): StaticArray<boolean> {
    return [
        Not(unchecked(in_[0])),
        Not(unchecked(in_[1])),
        Not(unchecked(in_[2])),
        Not(unchecked(in_[3])),
        Not(unchecked(in_[4])),
        Not(unchecked(in_[5])),
        Not(unchecked(in_[6])),
        Not(unchecked(in_[7])),
        Not(unchecked(in_[8])),
        Not(unchecked(in_[9])),
        Not(unchecked(in_[10])),
        Not(unchecked(in_[11])),
        Not(unchecked(in_[12])),
        Not(unchecked(in_[13])),
        Not(unchecked(in_[14])),
        Not(unchecked(in_[15])),
    ];
}

export function And16(a: StaticArray<boolean>, b: StaticArray<boolean>): StaticArray<boolean> {
    return [
        And(unchecked(a[0]), unchecked(b[0])),
        And(unchecked(a[1]), unchecked(b[1])),
        And(unchecked(a[2]), unchecked(b[2])),
        And(unchecked(a[3]), unchecked(b[3])),
        And(unchecked(a[4]), unchecked(b[4])),
        And(unchecked(a[5]), unchecked(b[5])),
        And(unchecked(a[6]), unchecked(b[6])),
        And(unchecked(a[7]), unchecked(b[7])),
        And(unchecked(a[8]), unchecked(b[8])),
        And(unchecked(a[9]), unchecked(b[9])),
        And(unchecked(a[10]), unchecked(b[10])),
        And(unchecked(a[11]), unchecked(b[11])),
        And(unchecked(a[12]), unchecked(b[12])),
        And(unchecked(a[13]), unchecked(b[13])),
        And(unchecked(a[14]), unchecked(b[14])),
        And(unchecked(a[15]), unchecked(b[15])),
    ];
}

export function Or16(a: StaticArray<boolean>, b: StaticArray<boolean>): StaticArray<boolean> {
    return [
        Or(unchecked(a[0]), unchecked(b[0])),
        Or(unchecked(a[1]), unchecked(b[1])),
        Or(unchecked(a[2]), unchecked(b[2])),
        Or(unchecked(a[3]), unchecked(b[3])),
        Or(unchecked(a[4]), unchecked(b[4])),
        Or(unchecked(a[5]), unchecked(b[5])),
        Or(unchecked(a[6]), unchecked(b[6])),
        Or(unchecked(a[7]), unchecked(b[7])),
        Or(unchecked(a[8]), unchecked(b[8])),
        Or(unchecked(a[9]), unchecked(b[9])),
        Or(unchecked(a[10]), unchecked(b[10])),
        Or(unchecked(a[11]), unchecked(b[11])),
        Or(unchecked(a[12]), unchecked(b[12])),
        Or(unchecked(a[13]), unchecked(b[13])),
        Or(unchecked(a[14]), unchecked(b[14])),
        Or(unchecked(a[15]), unchecked(b[15])),
    ];
}

export function Mux16(a: StaticArray<boolean>, b: StaticArray<boolean>, sel: boolean): StaticArray<boolean> {
    return [
        Mux(unchecked(a[0]), unchecked(b[0]), sel=sel),
        Mux(unchecked(a[1]), unchecked(b[1]), sel=sel),
        Mux(unchecked(a[2]), unchecked(b[2]), sel=sel),
        Mux(unchecked(a[3]), unchecked(b[3]), sel=sel),
        Mux(unchecked(a[4]), unchecked(b[4]), sel=sel),
        Mux(unchecked(a[5]), unchecked(b[5]), sel=sel),
        Mux(unchecked(a[6]), unchecked(b[6]), sel=sel),
        Mux(unchecked(a[7]), unchecked(b[7]), sel=sel),
        Mux(unchecked(a[8]), unchecked(b[8]), sel=sel),
        Mux(unchecked(a[9]), unchecked(b[9]), sel=sel),
        Mux(unchecked(a[10]), unchecked(b[10]), sel=sel),
        Mux(unchecked(a[11]), unchecked(b[11]), sel=sel),
        Mux(unchecked(a[12]), unchecked(b[12]), sel=sel),
        Mux(unchecked(a[13]), unchecked(b[13]), sel=sel),
        Mux(unchecked(a[14]), unchecked(b[14]), sel=sel),
        Mux(unchecked(a[15]), unchecked(b[15]), sel=sel),
    ];
}

// @ts-ignore
@inline
export function Or8Way(a: StaticArray<boolean>): boolean {
    return Or(
        unchecked(a[7]), Or(
            unchecked(a[6]), Or(
                unchecked(a[5]), Or(
                    unchecked(a[4]), Or(
                        unchecked(a[3]), Or(
                            unchecked(a[2]), Or(
                                unchecked(a[1]), unchecked(a[0])
                            )
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
    const lsb = unchecked(sel[1]);
    return Mux16(
        Mux16(a, b, lsb),
        Mux16(c, d, lsb),
        unchecked(sel[0])
    );
}

// @ts-ignore
@inline
export function Mux8Way16(a: StaticArray<boolean>, b: StaticArray<boolean>, c: StaticArray<boolean>, d: StaticArray<boolean>, e: StaticArray<boolean>, f: StaticArray<boolean>, g: StaticArray<boolean>, h: StaticArray<boolean>, sel: StaticArray<boolean>): StaticArray<boolean> {
    const sliced = sel.slice<StaticArray<boolean>>(1);
    return Mux16(
        Mux4Way16(a, b, c, d, sliced),
        Mux4Way16(e, f, g, h, sliced),
        unchecked(sel[0])
    );
}

// @ts-ignore
@inline
export function DMux4Way(in_: boolean, sel: StaticArray<boolean>): StaticArray<boolean> {
    const lsb = unchecked(sel[1]);
    const topbottom = DMux(in_, unchecked(sel[0]));
    return DMux(topbottom[0], lsb).concat(DMux(topbottom[1], lsb));
}

// @ts-ignore
@inline
export function DMux8Way(in_: boolean, sel: StaticArray<boolean>): StaticArray<boolean> {
    const sliced = sel.slice<StaticArray<boolean>>(1);
    const topbottom = DMux(in_, unchecked(sel[0]));
    return DMux4Way(topbottom[0], sliced).concat(DMux4Way(topbottom[1], sliced));
}