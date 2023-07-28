import { Xor, And, Or, Mux16, Not16, And16, Or8Way, Not } from "./gates";
import { one16, false16 } from "./builtins";

/*
// @ts-ignore
@inline
function HalfAdder(a: boolean, b: boolean): StaticArray<boolean> {
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
*/

export function Add16(a: StaticArray<boolean>, b: StaticArray<boolean>): StaticArray<boolean> {
    const out = new StaticArray<boolean>(16);
    const a0 = a[0];
    const a1 = a[1];
    const a2 = a[2];
    const a3 = a[3];
    const a4 = a[4];
    const a5 = a[5];
    const a6 = a[6];
    const a7 = a[7];
    const a8 = a[8];
    const a9 = a[9];
    const a10 = a[10];
    const a11 = a[11];
    const a12 = a[12];
    const a13 = a[13];
    const a14 = a[14];
    const a15 = a[15];
    const b0 = b[0];
    const b1 = b[1];
    const b2 = b[2];
    const b3 = b[3];
    const b4 = b[4];
    const b5 = b[5];
    const b6 = b[6];
    const b7 = b[7];
    const b8 = b[8];
    const b9 = b[9];
    const b10 = b[10];
    const b11 = b[11];
    const b12 = b[12];
    const b13 = b[13];
    const b14 = b[14];
    const b15 = b[15];
    out[15] = Xor(a15, b15);
    const carry14 = And(a15, b15);
    const x14 = Xor(b14, carry14);
    out[14] = Xor(a14, x14);

    const carry13 = Or(And(b14, carry14), And(a14, x14));
    const x13 = Xor(b13, carry13);
    out[13] = Xor(a13, x13);

    const carry12 = Or(And(b13, carry13), And(a13, x13));
    const x12 = Xor(b12, carry12);
    out[12] = Xor(a12, x12);

    const carry11 = Or(And(b12, carry12), And(a12, x12));
    const x11 = Xor(b11, carry11);
    out[11] = Xor(a11, x11);

    const carry10 = Or(And(b11, carry11), And(a11, x11));
    const x10 = Xor(b10, carry10);
    out[10] = Xor(a10, x10);

    const carry9 = Or(And(b10, carry10), And(a10, x10));
    const x9 = Xor(b9, carry9);
    out[9] = Xor(a9, x9);

    const carry8 = Or(And(b9, carry9), And(a9, x9));
    const x8 = Xor(b8, carry8);
    out[8] = Xor(a8, x8);

    const carry7 = Or(And(b8, carry8), And(a8, x8));
    const x7 = Xor(b7, carry7);
    out[7] = Xor(a7, x7);

    const carry6 = Or(And(b7, carry7), And(a7, x7));
    const x6 = Xor(b6, carry6);
    out[6] = Xor(a6, x6);

    const carry5 = Or(And(b6, carry6), And(a6, x6));
    const x5 = Xor(b5, carry5);
    out[5] = Xor(a5, x5);

    const carry4 = Or(And(b5, carry5), And(a5, x5));
    const x4 = Xor(b4, carry4);
    out[4] = Xor(a4, x4);

    const carry3 = Or(And(b4, carry4), And(a4, x4));
    const x3 = Xor(b3, carry3);
    out[3] = Xor(a3, x3);

    const carry2 = Or(And(b3, carry3), And(a3, x3));
    const x2 = Xor(b2, carry2);
    out[2] = Xor(a2, x2);

    const carry1 = Or(And(b2, carry2), And(a2, x2));
    const x1 = Xor(b1, carry1);
    out[1] = Xor(a1, x1);
    out[0] = Xor(a0, Xor(b0, Or(And(b1, carry1), And(a1, x1))));
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