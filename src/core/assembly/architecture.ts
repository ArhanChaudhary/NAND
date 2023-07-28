import { Inc16 } from "./arithmetic";
import { clock, false16 } from "./builtins";
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
        const out = this.dff.call(Mux(this.dffout, in_, load));
        this.dffout = out;
        return out;
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
    public call(in_: StaticArray<boolean>, load: boolean): StaticArray<boolean> {
        return [
            unchecked(this.bits[0]).call(unchecked(in_[0]), load),
            unchecked(this.bits[1]).call(unchecked(in_[1]), load),
            unchecked(this.bits[2]).call(unchecked(in_[2]), load),
            unchecked(this.bits[3]).call(unchecked(in_[3]), load),
            unchecked(this.bits[4]).call(unchecked(in_[4]), load),
            unchecked(this.bits[5]).call(unchecked(in_[5]), load),
            unchecked(this.bits[6]).call(unchecked(in_[6]), load),
            unchecked(this.bits[7]).call(unchecked(in_[7]), load),
            unchecked(this.bits[8]).call(unchecked(in_[8]), load),
            unchecked(this.bits[9]).call(unchecked(in_[9]), load),
            unchecked(this.bits[10]).call(unchecked(in_[10]), load),
            unchecked(this.bits[11]).call(unchecked(in_[11]), load),
            unchecked(this.bits[12]).call(unchecked(in_[12]), load),
            unchecked(this.bits[13]).call(unchecked(in_[13]), load),
            unchecked(this.bits[14]).call(unchecked(in_[14]), load),
            unchecked(this.bits[15]).call(unchecked(in_[15]), load),
        ]
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
    public call(in_: StaticArray<boolean>, load: boolean, address: StaticArray<boolean>): StaticArray<boolean> {
        const selector = DMux8Way(load, address);
        return Mux8Way16(
            unchecked(this.registers[0]).call(in_, unchecked(selector[0])),
            unchecked(this.registers[1]).call(in_, unchecked(selector[1])),
            unchecked(this.registers[2]).call(in_, unchecked(selector[2])),
            unchecked(this.registers[3]).call(in_, unchecked(selector[3])),
            unchecked(this.registers[4]).call(in_, unchecked(selector[4])),
            unchecked(this.registers[5]).call(in_, unchecked(selector[5])),
            unchecked(this.registers[6]).call(in_, unchecked(selector[6])),
            unchecked(this.registers[7]).call(in_, unchecked(selector[7])),
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
    public call(in_: StaticArray<boolean>, load: boolean, address: StaticArray<boolean>): StaticArray<boolean> {
        const selectoraddress = address.slice<StaticArray<boolean>>(0, 3);
        const selector = DMux8Way(load, selectoraddress);
        const ramaddress = address.slice<StaticArray<boolean>>(3);
        return Mux8Way16(
            unchecked(this.RAM8s[0]).call(in_, unchecked(selector[0]), ramaddress),
            unchecked(this.RAM8s[1]).call(in_, unchecked(selector[1]), ramaddress),
            unchecked(this.RAM8s[2]).call(in_, unchecked(selector[2]), ramaddress),
            unchecked(this.RAM8s[3]).call(in_, unchecked(selector[3]), ramaddress),
            unchecked(this.RAM8s[4]).call(in_, unchecked(selector[4]), ramaddress),
            unchecked(this.RAM8s[5]).call(in_, unchecked(selector[5]), ramaddress),
            unchecked(this.RAM8s[6]).call(in_, unchecked(selector[6]), ramaddress),
            unchecked(this.RAM8s[7]).call(in_, unchecked(selector[7]), ramaddress),
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
    public call(in_: StaticArray<boolean>, load: boolean, address: StaticArray<boolean>): StaticArray<boolean> {
        const selectoraddress = address.slice<StaticArray<boolean>>(0, 3);
        const selector = DMux8Way(load, selectoraddress);
        const ramaddress = address.slice<StaticArray<boolean>>(3);
        return Mux8Way16(
            unchecked(this.RAM64s[0]).call(in_, unchecked(selector[0]), ramaddress),
            unchecked(this.RAM64s[1]).call(in_, unchecked(selector[1]), ramaddress),
            unchecked(this.RAM64s[2]).call(in_, unchecked(selector[2]), ramaddress),
            unchecked(this.RAM64s[3]).call(in_, unchecked(selector[3]), ramaddress),
            unchecked(this.RAM64s[4]).call(in_, unchecked(selector[4]), ramaddress),
            unchecked(this.RAM64s[5]).call(in_, unchecked(selector[5]), ramaddress),
            unchecked(this.RAM64s[6]).call(in_, unchecked(selector[6]), ramaddress),
            unchecked(this.RAM64s[7]).call(in_, unchecked(selector[7]), ramaddress),
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
    public call(in_: StaticArray<boolean>, load: boolean, address: StaticArray<boolean>): StaticArray<boolean> {
        const selectoraddress = address.slice<StaticArray<boolean>>(0, 3);
        const selector = DMux8Way(load, selectoraddress);
        const ramaddress = address.slice<StaticArray<boolean>>(3);
        return Mux8Way16(
            unchecked(this.RAM512s[0]).call(in_, unchecked(selector[0]), ramaddress),
            unchecked(this.RAM512s[1]).call(in_, unchecked(selector[1]), ramaddress),
            unchecked(this.RAM512s[2]).call(in_, unchecked(selector[2]), ramaddress),
            unchecked(this.RAM512s[3]).call(in_, unchecked(selector[3]), ramaddress),
            unchecked(this.RAM512s[4]).call(in_, unchecked(selector[4]), ramaddress),
            unchecked(this.RAM512s[5]).call(in_, unchecked(selector[5]), ramaddress),
            unchecked(this.RAM512s[6]).call(in_, unchecked(selector[6]), ramaddress),
            unchecked(this.RAM512s[7]).call(in_, unchecked(selector[7]), ramaddress),
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
export function RAM16K(in_: StaticArray<boolean>, load: boolean, address: StaticArray<boolean>): StaticArray<boolean> {
    const selectoraddress = address.slice<StaticArray<boolean>>(0, 2);
    const selector = DMux4Way(load, selectoraddress);
    const ramaddress = address.slice<StaticArray<boolean>>(2);
    return Mux4Way16(
        unchecked(RAM4Ks[0]).call(in_, unchecked(selector[0]), ramaddress),
        unchecked(RAM4Ks[1]).call(in_, unchecked(selector[1]), ramaddress),
        unchecked(RAM4Ks[2]).call(in_, unchecked(selector[2]), ramaddress),
        unchecked(RAM4Ks[3]).call(in_, unchecked(selector[3]), ramaddress),
        selectoraddress,
    );
}

let PC_dffout = false16;
const PC_reg = new Register();
// @ts-ignore
@inline
export function PC(in_: StaticArray<boolean>, load: boolean, inc: boolean, reset: boolean): StaticArray<boolean> {
    const out = PC_reg.call(
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
    PC_dffout = out;
    return out;
}

