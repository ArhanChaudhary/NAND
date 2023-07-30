import { Inc16 } from "./arithmetic";
import { clock, nBit16, word16 } from "./builtins";
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
    private bits: StaticArray<Bit> = [
        new Bit(),
        new Bit(),
        new Bit(),
        new Bit(),
        new Bit(),
        new Bit(),
        new Bit(),
        new Bit(),
        new Bit(),
        new Bit(),
        new Bit(),
        new Bit(),
        new Bit(),
        new Bit(),
        new Bit(),
        new Bit(),
    ];
    public call(in_: u16, load: boolean): u16 {
        return word16(
            this.bits[0].call(nBit16(in_, 0), load),
            this.bits[1].call(nBit16(in_, 1), load),
            this.bits[2].call(nBit16(in_, 2), load),
            this.bits[3].call(nBit16(in_, 3), load),
            this.bits[4].call(nBit16(in_, 4), load),
            this.bits[5].call(nBit16(in_, 5), load),
            this.bits[6].call(nBit16(in_, 6), load),
            this.bits[7].call(nBit16(in_, 7), load),
            this.bits[8].call(nBit16(in_, 8), load),
            this.bits[9].call(nBit16(in_, 9), load),
            this.bits[10].call(nBit16(in_, 10), load),
            this.bits[11].call(nBit16(in_, 11), load),
            this.bits[12].call(nBit16(in_, 12), load),
            this.bits[13].call(nBit16(in_, 13), load),
            this.bits[14].call(nBit16(in_, 14), load),
            this.bits[15].call(nBit16(in_, 15), load),
        );
    }
}

class RAM8 {
    private registers: StaticArray<Register> = [
        new Register(),
        new Register(),
        new Register(),
        new Register(),
        new Register(),
        new Register(),
        new Register(),
        new Register(),
    ];
    public call(in_: u16, load: boolean, address: u8): u16 {
        const selector = DMux8Way(load, address);
        return Mux8Way16(
            this.registers[0].call(in_, nBit16(selector, 0)),
            this.registers[1].call(in_, nBit16(selector, 1)),
            this.registers[2].call(in_, nBit16(selector, 2)),
            this.registers[3].call(in_, nBit16(selector, 3)),
            this.registers[4].call(in_, nBit16(selector, 4)),
            this.registers[5].call(in_, nBit16(selector, 5)),
            this.registers[6].call(in_, nBit16(selector, 6)),
            this.registers[7].call(in_, nBit16(selector, 7)),
            address
        )
    }
}

class RAM64 {
    private RAM8s: StaticArray<RAM8> = [
        new RAM8(),
        new RAM8(),
        new RAM8(),
        new RAM8(),
        new RAM8(),
        new RAM8(),
        new RAM8(),
        new RAM8(),
    ];
    public call(in_: u16, load: boolean, address: u8): u16 {
        const selectoraddress = address >> 3;
        const selector = DMux8Way(load, selectoraddress);
        const ramaddress = address & 7;
        return Mux8Way16(
            this.RAM8s[0].call(in_, nBit16(selector, 0), ramaddress),
            this.RAM8s[1].call(in_, nBit16(selector, 1), ramaddress),
            this.RAM8s[2].call(in_, nBit16(selector, 2), ramaddress),
            this.RAM8s[3].call(in_, nBit16(selector, 3), ramaddress),
            this.RAM8s[4].call(in_, nBit16(selector, 4), ramaddress),
            this.RAM8s[5].call(in_, nBit16(selector, 5), ramaddress),
            this.RAM8s[6].call(in_, nBit16(selector, 6), ramaddress),
            this.RAM8s[7].call(in_, nBit16(selector, 7), ramaddress),
            selectoraddress,
        )
    }
}

class RAM512 {
    private RAM64s: StaticArray<RAM64> = [
        new RAM64(),
        new RAM64(),
        new RAM64(),
        new RAM64(),
        new RAM64(),
        new RAM64(),
        new RAM64(),
        new RAM64(),
    ];
    public call(in_: u16, load: boolean, address: u16): u16 {
        const selectoraddress = <u8>(address >> 6);
        const selector = DMux8Way(load, selectoraddress);
        const ramaddress = <u8>(address & 63);
        return Mux8Way16(
            this.RAM64s[0].call(in_, nBit16(selector, 0), ramaddress),
            this.RAM64s[1].call(in_, nBit16(selector, 1), ramaddress),
            this.RAM64s[2].call(in_, nBit16(selector, 2), ramaddress),
            this.RAM64s[3].call(in_, nBit16(selector, 3), ramaddress),
            this.RAM64s[4].call(in_, nBit16(selector, 4), ramaddress),
            this.RAM64s[5].call(in_, nBit16(selector, 5), ramaddress),
            this.RAM64s[6].call(in_, nBit16(selector, 6), ramaddress),
            this.RAM64s[7].call(in_, nBit16(selector, 7), ramaddress),
            selectoraddress,
        )
    }
}

class RAM4K {
    private RAM512s: StaticArray<RAM512> = [
        new RAM512(),
        new RAM512(),
        new RAM512(),
        new RAM512(),
        new RAM512(),
        new RAM512(),
        new RAM512(),
        new RAM512(),
    ];
    public call(in_: u16, load: boolean, address: u16): u16 {
        const selectoraddress = <u8>(address >> 9);
        const selector = DMux8Way(load, selectoraddress);
        const ramaddress = address & 511;
        return Mux8Way16(
            this.RAM512s[0].call(in_, nBit16(selector, 0), ramaddress),
            this.RAM512s[1].call(in_, nBit16(selector, 1), ramaddress),
            this.RAM512s[2].call(in_, nBit16(selector, 2), ramaddress),
            this.RAM512s[3].call(in_, nBit16(selector, 3), ramaddress),
            this.RAM512s[4].call(in_, nBit16(selector, 4), ramaddress),
            this.RAM512s[5].call(in_, nBit16(selector, 5), ramaddress),
            this.RAM512s[6].call(in_, nBit16(selector, 6), ramaddress),
            this.RAM512s[7].call(in_, nBit16(selector, 7), ramaddress),
            selectoraddress,
        )
    }
}

const RAM4Ks: StaticArray<RAM4K> = [
    new RAM4K(),
    new RAM4K(),
    new RAM4K(),
    new RAM4K(),
];

// @ts-ignore
@inline
export function RAM16K(in_: u16, load: boolean, address: u16): u16 {
    const selectoraddress = <u8>(address >> 12);
    const selector = DMux4Way(load, selectoraddress);
    const ramaddress = address & 4095;
    return Mux4Way16(
        RAM4Ks[0].call(in_, nBit16(selector, 0), ramaddress),
        RAM4Ks[1].call(in_, nBit16(selector, 1), ramaddress),
        RAM4Ks[2].call(in_, nBit16(selector, 2), ramaddress),
        RAM4Ks[3].call(in_, nBit16(selector, 3), ramaddress),
        selectoraddress,
    );
}

let PC_dffout = false16;
const PC_reg = new Register();
// @ts-ignore
@inline
export function PC(in_: StaticArray<boolean>, load: boolean, inc: boolean, reset: boolean): StaticArray<boolean> {
    return PC_dffout = PC_reg.call(
        // reset
        Mux16(
            // load
            Mux16(
                // inc
                Mux16(PC_dffout, Inc16(PC_dffout), inc),
                in_,
                load
            ),
            false16,
            reset
        ),
        Or(
            Or(
                load,
                inc,
            ),
            reset,
        )
    );
}

*/