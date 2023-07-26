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
    let curr = HalfAdder(unchecked(a[15]), unchecked(b[15]));
    unchecked(out[15] = curr[0]);
    curr = FullAdder(unchecked(a[14]), unchecked(b[14]), unchecked(curr[1]));
    unchecked(out[14] = curr[0]);
    curr = FullAdder(unchecked(a[13]), unchecked(b[13]), unchecked(curr[1]));
    unchecked(out[13] = curr[0]);
    curr = FullAdder(unchecked(a[12]), unchecked(b[12]), unchecked(curr[1]));
    unchecked(out[12] = curr[0]);
    curr = FullAdder(unchecked(a[11]), unchecked(b[11]), unchecked(curr[1]));
    unchecked(out[11] = curr[0]);
    curr = FullAdder(unchecked(a[10]), unchecked(b[10]), unchecked(curr[1]));
    unchecked(out[10] = curr[0]);
    curr = FullAdder(unchecked(a[9]), unchecked(b[9]), unchecked(curr[1]));
    unchecked(out[9] = curr[0]);
    curr = FullAdder(unchecked(a[8]), unchecked(b[8]), unchecked(curr[1]));
    unchecked(out[8] = curr[0]);
    curr = FullAdder(unchecked(a[7]), unchecked(b[7]), unchecked(curr[1]));
    unchecked(out[7] = curr[0]);
    curr = FullAdder(unchecked(a[6]), unchecked(b[6]), unchecked(curr[1]));
    unchecked(out[6] = curr[0]);
    curr = FullAdder(unchecked(a[5]), unchecked(b[5]), unchecked(curr[1]));
    unchecked(out[5] = curr[0]);
    curr = FullAdder(unchecked(a[4]), unchecked(b[4]), unchecked(curr[1]));
    unchecked(out[4] = curr[0]);
    curr = FullAdder(unchecked(a[3]), unchecked(b[3]), unchecked(curr[1]));
    unchecked(out[3] = curr[0]);
    curr = FullAdder(unchecked(a[2]), unchecked(b[2]), unchecked(curr[1]));
    unchecked(out[2] = curr[0]);
    curr = FullAdder(unchecked(a[1]), unchecked(b[1]), unchecked(curr[1]));
    unchecked(out[1] = curr[0]);
    unchecked(out[0] = FullAdder(unchecked(a[0]), unchecked(b[0]), unchecked(curr[1]))[0]);
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