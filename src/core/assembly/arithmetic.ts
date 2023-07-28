import { Xor, And, Or, Mux16, Not16, And16, Or8Way, Not } from "./gates";
import { one16, false16 } from "./builtins";

// @ts-ignore
@inline
export function HalfAdder(a: boolean, b: boolean): StaticArray<boolean> {
    return [
        Xor(a, b),
        And(a, b),
    ];
}

// @ts-ignore
@inline
function FullAdder(a: boolean, b: boolean, c: boolean): StaticArray<boolean> {
    const x = Xor(b, c);
    return [
        Xor(a, x),
        Or(And(b, c), And(a, x)),
    ];
}

// @ts-ignore
@inline
export function Add16(a: StaticArray<boolean>, b: StaticArray<boolean>): StaticArray<boolean> {
    const out = new StaticArray<boolean>(16);
    let curr = HalfAdder(a[15], b[15]);
    out[15] = curr[0];
    curr = FullAdder(a[14], b[14], curr[1]);
    out[14] = curr[0];
    curr = FullAdder(a[13], b[13], curr[1]);
    out[13] = curr[0];
    curr = FullAdder(a[12], b[12], curr[1]);
    out[12] = curr[0];
    curr = FullAdder(a[11], b[11], curr[1]);
    out[11] = curr[0];
    curr = FullAdder(a[10], b[10], curr[1]);
    out[10] = curr[0];
    curr = FullAdder(a[9], b[9], curr[1]);
    out[9] = curr[0];
    curr = FullAdder(a[8], b[8], curr[1]);
    out[8] = curr[0];
    curr = FullAdder(a[7], b[7], curr[1]);
    out[7] = curr[0];
    curr = FullAdder(a[6], b[6], curr[1]);
    out[6] = curr[0];
    curr = FullAdder(a[5], b[5], curr[1]);
    out[5] = curr[0];
    curr = FullAdder(a[4], b[4], curr[1]);
    out[4] = curr[0];
    curr = FullAdder(a[3], b[3], curr[1]);
    out[3] = curr[0];
    curr = FullAdder(a[2], b[2], curr[1]);
    out[2] = curr[0];
    curr = FullAdder(a[1], b[1], curr[1]);
    out[1] = curr[0];
    out[0] = FullAdder(a[0], b[0], curr[1])[0];
    return out;
}

// @ts-ignore
@inline
export function Inc16(in_: StaticArray<boolean>): StaticArray<boolean> {
    return Add16(in_, one16);
}

// @ts-ignore
@inline
export function ALU(x: StaticArray<boolean>, y: StaticArray<boolean>, zx: boolean, nx: boolean, zy: boolean, ny: boolean, f: boolean, no: boolean): StaticArray<boolean> {
    // zx
    const x1 = Mux16(x, false16, zx);
    // nx
    const x2 = Mux16(x1, Not16(x1), nx);
    // zy
    const y1 = Mux16(y, false16, zy);
    // ny
    const y2 = Mux16(y1, Not16(y1), ny);
    // f
    const out1 = Mux16(And16(x2, y2), Add16(x2, y2), f);
    // no
    const out2 = Mux16(out1, Not16(out1), no);
    return out2.concat(<StaticArray<boolean>>[
        // zr
        Not(Or(Or8Way(out2.slice<StaticArray<boolean>>(0, 8)), Or8Way(out2.slice<StaticArray<boolean>>(8)))),
        // ng
        out2[0],
    ]);
}