import { nBit16, nBit16_0, word16 } from "./builtins";
import { Xor, And, Or, Mux16, Not16, And16 } from "./gates";

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

export function Add16(a: u16, b: u16): u16 {
    const a0 = nBit16_0(a);
    const a1 = nBit16(a, 1);
    const a2 = nBit16(a, 2);
    const a3 = nBit16(a, 3);
    const a4 = nBit16(a, 4);
    const a5 = nBit16(a, 5);
    const a6 = nBit16(a, 6);
    const a7 = nBit16(a, 7);
    const a8 = nBit16(a, 8);
    const a9 = nBit16(a, 9);
    const a10 = nBit16(a, 10);
    const a11 = nBit16(a, 11);
    const a12 = nBit16(a, 12);
    const a13 = nBit16(a, 13);
    const a14 = nBit16(a, 14);
    const a15 = nBit16(a, 15);
    const b0 = nBit16_0(b);
    const b1 = nBit16(b, 1);
    const b2 = nBit16(b, 2);
    const b3 = nBit16(b, 3);
    const b4 = nBit16(b, 4);
    const b5 = nBit16(b, 5);
    const b6 = nBit16(b, 6);
    const b7 = nBit16(b, 7);
    const b8 = nBit16(b, 8);
    const b9 = nBit16(b, 9);
    const b10 = nBit16(b, 10);
    const b11 = nBit16(b, 11);
    const b12 = nBit16(b, 12);
    const b13 = nBit16(b, 13);
    const b14 = nBit16(b, 14);
    const b15 = nBit16(b, 15);
    const carry1 = And(a0, b0);
    const x1 = Xor(b1, carry1);
    const carry2 = Or(And(b1, carry1), And(a1, x1));
    const x2 = Xor(b2, carry2);
    const carry3 = Or(And(b2, carry2), And(a2, x2));
    const x3 = Xor(b3, carry3);
    const carry4 = Or(And(b3, carry3), And(a3, x3));
    const x4 = Xor(b4, carry4);
    const carry5 = Or(And(b4, carry4), And(a4, x4));
    const x5 = Xor(b5, carry5);
    const carry6 = Or(And(b5, carry5), And(a5, x5));
    const x6 = Xor(b6, carry6);
    const carry7 = Or(And(b6, carry6), And(a6, x6));
    const x7 = Xor(b7, carry7);
    const carry8 = Or(And(b7, carry7), And(a7, x7));
    const x8 = Xor(b8, carry8);
    const carry9 = Or(And(b8, carry8), And(a8, x8));
    const x9 = Xor(b9, carry9);
    const carry10 = Or(And(b9, carry9), And(a9, x9));
    const x10 = Xor(b10, carry10);
    const carry11 = Or(And(b10, carry10), And(a10, x10));
    const x11 = Xor(b11, carry11);
    const carry12 = Or(And(b11, carry11), And(a11, x11));
    const x12 = Xor(b12, carry12);
    const carry13 = Or(And(b12, carry12), And(a12, x12));
    const x13 = Xor(b13, carry13);
    const carry14 = Or(And(b13, carry13), And(a13, x13));
    const x14 = Xor(b14, carry14);
    return word16(
        Xor(a0, b0),
        Xor(a1, x1),
        Xor(a2, x2),
        Xor(a3, x3),
        Xor(a4, x4),
        Xor(a5, x5),
        Xor(a6, x6),
        Xor(a7, x7),
        Xor(a8, x8),
        Xor(a9, x9),
        Xor(a10, x10),
        Xor(a11, x11),
        Xor(a12, x12),
        Xor(a13, x13),
        Xor(a14, x14),
        Xor(a15, Xor(b15, Or(And(b14, carry14), And(a14, x14)))),
    );
}

// @ts-ignore
@inline
export function Inc16(in_: u16): u16 {
    return Add16(in_, 1);
}

// @ts-ignore
@inline
// NOTE: combining all the booleans into a single opcode doesn't seem to have any performance impact
export function ALU(x: u16, y: u16, zx: boolean, nx: boolean, zy: boolean, ny: boolean, f: boolean, no: boolean): u16 {
    // zx
    const x1 = Mux16(x, 0, zx);
    // nx
    const x2 = Mux16(x1, Not16(x1), nx);
    // zy
    const y1 = Mux16(y, 0, zy);
    // ny
    const y2 = Mux16(y1, Not16(y1), ny);
    // f
    const out1 = Mux16(And16(x2, y2), Add16(x2, y2), f);
    // no
    return Mux16(out1, Not16(out1), no);
}