// @ts-ignore
@inline
export function NAND(a: boolean, b: boolean): boolean {
	return !(a && b);
}

// @ts-ignore
@inline
export function nBit(n: i16, i: u8): boolean {
	// @ts-ignore
	return <boolean>((n >> i) & 1);
}

// @ts-ignore
@inline
export function placeBit(b: boolean, i: u8): i16 {
	// @ts-ignore
	return <i16>b << i;
}

export let clock = true;
// @ts-ignore
@inline
export function tick(): void {
    clock = true;
}

// @ts-ignore
@inline
export function tock(): void {
    clock = false;
}