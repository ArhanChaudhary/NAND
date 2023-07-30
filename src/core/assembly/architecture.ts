import { Inc16 } from "./arithmetic";
import { clock, nBit16, slice16_0to11, slice16_0to2, slice16_0to5, slice16_0to8, slice16_12to13, slice16_3to5, slice16_6to8, slice16_9to11, word16 } from "./builtins";
import { DMux4Way, DMux8Way, Mux, Mux16, Mux4Way16, Mux8Way16, Or } from "./gates";

class DFF {
    private prev: boolean = false;
    public call(in_: boolean): boolean {
        const out = this.prev;
        if (clock) {
            this.prev = in_;
        }
        return out;
    }
}

class Bit {
    private dffout: boolean = false;
    private dff: DFF = new DFF();
    public call(in_: boolean, load: boolean): boolean {
        return this.dffout = this.dff.call(Mux(this.dffout, in_, load));
    }
}

class Register {
    private bits_0: Bit = new Bit();
    private bits_1: Bit = new Bit();
    private bits_2: Bit = new Bit();
    private bits_3: Bit = new Bit();
    private bits_4: Bit = new Bit();
    private bits_5: Bit = new Bit();
    private bits_6: Bit = new Bit();
    private bits_7: Bit = new Bit();
    private bits_8: Bit = new Bit();
    private bits_9: Bit = new Bit();
    private bits_10: Bit = new Bit();
    private bits_11: Bit = new Bit();
    private bits_12: Bit = new Bit();
    private bits_13: Bit = new Bit();
    private bits_14: Bit = new Bit();
    private bits_15: Bit = new Bit();
    public call(in_: u16, load: boolean): u16 {
        return word16(
            this.bits_0.call(nBit16(in_, 0), load),
            this.bits_1.call(nBit16(in_, 1), load),
            this.bits_2.call(nBit16(in_, 2), load),
            this.bits_3.call(nBit16(in_, 3), load),
            this.bits_4.call(nBit16(in_, 4), load),
            this.bits_5.call(nBit16(in_, 5), load),
            this.bits_6.call(nBit16(in_, 6), load),
            this.bits_7.call(nBit16(in_, 7), load),
            this.bits_8.call(nBit16(in_, 8), load),
            this.bits_9.call(nBit16(in_, 9), load),
            this.bits_10.call(nBit16(in_, 10), load),
            this.bits_11.call(nBit16(in_, 11), load),
            this.bits_12.call(nBit16(in_, 12), load),
            this.bits_13.call(nBit16(in_, 13), load),
            this.bits_14.call(nBit16(in_, 14), load),
            this.bits_15.call(nBit16(in_, 15), load),
        );
    }
}

class RAM8 {
    private registers_0: Register = new Register();
    private registers_1: Register = new Register();
    private registers_2: Register = new Register();
    private registers_3: Register = new Register();
    private registers_4: Register = new Register();
    private registers_5: Register = new Register();
    private registers_6: Register = new Register();
    private registers_7: Register = new Register();
    public call(in_: u16, load: boolean, address: u8): u16 {
        const selector = DMux8Way(load, address);
        return Mux8Way16(
            this.registers_0.call(in_, nBit16(selector, 0)),
            this.registers_1.call(in_, nBit16(selector, 1)),
            this.registers_2.call(in_, nBit16(selector, 2)),
            this.registers_3.call(in_, nBit16(selector, 3)),
            this.registers_4.call(in_, nBit16(selector, 4)),
            this.registers_5.call(in_, nBit16(selector, 5)),
            this.registers_6.call(in_, nBit16(selector, 6)),
            this.registers_7.call(in_, nBit16(selector, 7)),
            address
        )
    }
}

class RAM64 {
    private RAM8s_0: RAM8 = new RAM8();
    private RAM8s_1: RAM8 = new RAM8();
    private RAM8s_2: RAM8 = new RAM8();
    private RAM8s_3: RAM8 = new RAM8();
    private RAM8s_4: RAM8 = new RAM8();
    private RAM8s_5: RAM8 = new RAM8();
    private RAM8s_6: RAM8 = new RAM8();
    private RAM8s_7: RAM8 = new RAM8();
    public call(in_: u16, load: boolean, address: u8): u16 {
        const selectoraddress = slice16_3to5(address);
        const selector = DMux8Way(load, selectoraddress);
        const ramaddress = slice16_0to2(address);
        return Mux8Way16(
            this.RAM8s_0.call(in_, nBit16(selector, 0), ramaddress),
            this.RAM8s_1.call(in_, nBit16(selector, 1), ramaddress),
            this.RAM8s_2.call(in_, nBit16(selector, 2), ramaddress),
            this.RAM8s_3.call(in_, nBit16(selector, 3), ramaddress),
            this.RAM8s_4.call(in_, nBit16(selector, 4), ramaddress),
            this.RAM8s_5.call(in_, nBit16(selector, 5), ramaddress),
            this.RAM8s_6.call(in_, nBit16(selector, 6), ramaddress),
            this.RAM8s_7.call(in_, nBit16(selector, 7), ramaddress),
            selectoraddress,
        )
    }
}

class RAM512 {
    private RAM64s_0: RAM64 = new RAM64();
    private RAM64s_1: RAM64 = new RAM64();
    private RAM64s_2: RAM64 = new RAM64();
    private RAM64s_3: RAM64 = new RAM64();
    private RAM64s_4: RAM64 = new RAM64();
    private RAM64s_5: RAM64 = new RAM64();
    private RAM64s_6: RAM64 = new RAM64();
    private RAM64s_7: RAM64 = new RAM64();
    public call(in_: u16, load: boolean, address: u16): u16 {
        const selectoraddress = slice16_6to8(address);
        const selector = DMux8Way(load, selectoraddress);
        const ramaddress = slice16_0to5(address);
        return Mux8Way16(
            this.RAM64s_0.call(in_, nBit16(selector, 0), ramaddress),
            this.RAM64s_1.call(in_, nBit16(selector, 1), ramaddress),
            this.RAM64s_2.call(in_, nBit16(selector, 2), ramaddress),
            this.RAM64s_3.call(in_, nBit16(selector, 3), ramaddress),
            this.RAM64s_4.call(in_, nBit16(selector, 4), ramaddress),
            this.RAM64s_5.call(in_, nBit16(selector, 5), ramaddress),
            this.RAM64s_6.call(in_, nBit16(selector, 6), ramaddress),
            this.RAM64s_7.call(in_, nBit16(selector, 7), ramaddress),
            selectoraddress,
        )
    }
}

class RAM4K {
    private RAM512s_0: RAM512 = new RAM512();
    private RAM512s_1: RAM512 = new RAM512();
    private RAM512s_2: RAM512 = new RAM512();
    private RAM512s_3: RAM512 = new RAM512();
    private RAM512s_4: RAM512 = new RAM512();
    private RAM512s_5: RAM512 = new RAM512();
    private RAM512s_6: RAM512 = new RAM512();
    private RAM512s_7: RAM512 = new RAM512();
    // @ts-ignore
    @inline
    public call(in_: u16, load: boolean, address: u16): u16 {
        const selectoraddress = slice16_9to11(address);
        const selector = DMux8Way(load, selectoraddress);
        const ramaddress = slice16_0to8(address);
        return Mux8Way16(
            this.RAM512s_0.call(in_, nBit16(selector, 0), ramaddress),
            this.RAM512s_1.call(in_, nBit16(selector, 1), ramaddress),
            this.RAM512s_2.call(in_, nBit16(selector, 2), ramaddress),
            this.RAM512s_3.call(in_, nBit16(selector, 3), ramaddress),
            this.RAM512s_4.call(in_, nBit16(selector, 4), ramaddress),
            this.RAM512s_5.call(in_, nBit16(selector, 5), ramaddress),
            this.RAM512s_6.call(in_, nBit16(selector, 6), ramaddress),
            this.RAM512s_7.call(in_, nBit16(selector, 7), ramaddress),
            selectoraddress,
        )
    }
}

const RAM4Ks_0 = new RAM4K();
const RAM4Ks_1 = new RAM4K();
const RAM4Ks_2 = new RAM4K();
const RAM4Ks_3 = new RAM4K();

// TODO: combine load bit with address

// @ts-ignore
@inline
export function RAM16K(in_: u16, load: boolean, address: u16): u16 {
    const selectoraddress = slice16_12to13(address);
    const selector = DMux4Way(load, selectoraddress);
    const ramaddress = slice16_0to11(address);
    return Mux4Way16(
        RAM4Ks_0.call(in_, nBit16(selector, 0), ramaddress),
        RAM4Ks_1.call(in_, nBit16(selector, 1), ramaddress),
        RAM4Ks_2.call(in_, nBit16(selector, 2), ramaddress),
        RAM4Ks_3.call(in_, nBit16(selector, 3), ramaddress),
        selectoraddress,
    );
}


let PC_dffout = 0;
const PC_reg = new Register();
// @ts-ignore
@inline
export function PC(in_: u16, load: boolean, reset: boolean): u16 {
    return PC_dffout = PC_reg.call(
        // reset
        Mux16(
            // load
            Mux16(
                // inc
                Inc16(PC_dffout),
                in_,
                load
            ),
            0,
            reset
        ),
        true,
    );
}
