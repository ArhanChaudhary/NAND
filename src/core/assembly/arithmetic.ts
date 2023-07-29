import { nBit, placeBit } from "./builtins";
import { Xor, And, Or, Mux16, Not16, And16, Or8Way, Not } from "./gates";

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

export function Add16(a: i16, b: i16): i16 {
    const a0 = nBit(a, 0);
    const a1 = nBit(a, 1);
    const a2 = nBit(a, 2);
    const a3 = nBit(a, 3);
    const a4 = nBit(a, 4);
    const a5 = nBit(a, 5);
    const a6 = nBit(a, 6);
    const a7 = nBit(a, 7);
    const a8 = nBit(a, 8);
    const a9 = nBit(a, 9);
    const a10 = nBit(a, 10);
    const a11 = nBit(a, 11);
    const a12 = nBit(a, 12);
    const a13 = nBit(a, 13);
    const a14 = nBit(a, 14);
    const a15 = nBit(a, 15);
    const b0 = nBit(b, 0);
    const b1 = nBit(b, 1);
    const b2 = nBit(b, 2);
    const b3 = nBit(b, 3);
    const b4 = nBit(b, 4);
    const b5 = nBit(b, 5);
    const b6 = nBit(b, 6);
    const b7 = nBit(b, 7);
    const b8 = nBit(b, 8);
    const b9 = nBit(b, 9);
    const b10 = nBit(b, 10);
    const b11 = nBit(b, 11);
    const b12 = nBit(b, 12);
    const b13 = nBit(b, 13);
    const b14 = nBit(b, 14);
    const b15 = nBit(b, 15);
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
    return placeBit(Xor(a0, b0), 0) +
        placeBit(Xor(a1, x1), 1) +
        placeBit(Xor(a2, x2), 2) +
        placeBit(Xor(a3, x3), 3) +
        placeBit(Xor(a4, x4), 4) +
        placeBit(Xor(a5, x5), 5) +
        placeBit(Xor(a6, x6), 6) +
        placeBit(Xor(a7, x7), 7) +
        placeBit(Xor(a8, x8), 8) +
        placeBit(Xor(a9, x9), 9) +
        placeBit(Xor(a10, x10), 10) +
        placeBit(Xor(a11, x11), 11) +
        placeBit(Xor(a12, x12), 12) +
        placeBit(Xor(a13, x13), 13) +
        placeBit(Xor(a14, x14), 14) +
        placeBit(Xor(a15, Xor(b15, Or(And(b14, carry14), And(a14, x14)))), 15);
}

// @ts-ignore
@inline
export function Inc16(in_: i16): i16 {
    return Add16(in_, 1);
}


// @ts-ignore
@inline
export function ALU(x: i16, y: i16, opcode: i8): i16 {
    // zx
    const x1 = Mux16(x, 0, nBit(opcode, 0));
    // nx
    const x2 = Mux16(x1, Not16(x1), nBit(opcode, 1));
    // zy
    const y1 = Mux16(y, 0, nBit(opcode, 2));
    // ny
    const y2 = Mux16(y1, Not16(y1), nBit(opcode, 3));
    // f
    const out1 = Mux16(And16(x2, y2), Add16(x2, y2), nBit(opcode, 4));
    // no
    const out2 = Mux16(out1, Not16(out1), nBit(opcode, 5));
    return out2;
    //     // zr
    //     placeBit(
    //         Not(
    //             Or(
    //                 nBit(out2, 15),
    //                 Or(
    //                     nBit(out2, 14),
    //                     Or(
    //                         nBit(out2, 13),
    //                         Or(
    //                             nBit(out2, 12),
    //                             Or(
    //                                 nBit(out2, 11),
    //                                 Or(
    //                                     nBit(out2, 10),
    //                                     Or(
    //                                         nBit(out2, 9),
    //                                         Or(
    //                                             nBit(out2, 8),
    //                                             Or(
    //                                                 nBit(out2, 7),
    //                                                 Or(
    //                                                     nBit(out2, 6),
    //                                                     Or(
    //                                                         nBit(out2, 5),
    //                                                         Or(
    //                                                             nBit(out2, 4),
    //                                                             Or(
    //                                                                 nBit(out2, 3),
    //                                                                 Or(
    //                                                                     nBit(out2, 2),
    //                                                                     Or(nBit(out2, 1), nBit(out2, 0))
    //                                                                 )
    //                                                             )
    //                                                         )
    //                                                     )
    //                                                 )
    //                                             )
    //                                         )
    //                                     )
    //                                 )
    //                             )
    //                         )
    //                     )
    //                 )
    //             )
    //         ),
    //         16
    //     ) +
    //     // ng
    //     placeBit(nBit(out2, 15), 17);
}