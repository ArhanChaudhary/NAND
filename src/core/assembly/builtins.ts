// @ts-ignore
@inline
export function NAND(a: boolean, b: boolean): boolean {
	return !(a && b);
}

// @ts-ignore
@inline
export function nBit16(n: i16, i: u8): boolean {
	// @ts-ignore
	return <boolean>((n >> i) & 1);
}

// @ts-ignore
@inline
export function nBit16_0(n: i16): boolean {
	// @ts-ignore
	return <boolean>(n & 1);
}

// @ts-ignore
@inline
function placeBit16(b: boolean, i: u8): i16 {
	// @ts-ignore
	return <i16>b << i;
}

// @ts-ignore
@inline
function placeBit16_0(b: boolean): i16 {
	// @ts-ignore
	return <i16>b;
}

// @ts-ignore
@inline
export function word2(a: boolean, b: boolean): i8 {
	return <i8>(
		placeBit16_0(a) |
		placeBit16(b, 1)
	);
}

// @ts-ignore
@inline
export function word4(a: boolean, b: boolean, c: boolean, d: boolean): i8 {
	return <i8>(
		placeBit16_0(a) |
		placeBit16(b, 1) |
		placeBit16(c, 2) |
		placeBit16(d, 3)
	)
}

// @ts-ignore
@inline
export function word8(a: boolean, b: boolean, c: boolean, d: boolean, e: boolean, f: boolean, g: boolean, h: boolean): i8 {
	return <i8>(
		placeBit16_0(a) |
		placeBit16(b, 1) |
		placeBit16(c, 2) |
		placeBit16(d, 3) |
		placeBit16(e, 4) |
		placeBit16(f, 5) |
		placeBit16(g, 6) |
		placeBit16(h, 7)
	)
}

// @ts-ignore
@inline
export function word16(a: boolean, b: boolean, c: boolean, d: boolean, e: boolean, f: boolean, g: boolean, h: boolean, 
						i: boolean, j: boolean, k: boolean, l: boolean, m: boolean, n: boolean, o: boolean, p: boolean): i16 {
	return placeBit16_0(a) |
			placeBit16(b, 1) |
			placeBit16(c, 2) |
			placeBit16(d, 3) |
			placeBit16(e, 4) |
			placeBit16(f, 5) |
			placeBit16(g, 6) |
			placeBit16(h, 7) |
			placeBit16(i, 8) |
			placeBit16(j, 9) |
			placeBit16(k, 10) |
			placeBit16(l, 11) |
			placeBit16(m, 12) |
			placeBit16(n, 13) |
			placeBit16(o, 14) |
			placeBit16(p, 15)
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