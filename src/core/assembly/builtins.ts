// @ts-ignore
@inline
export function NAND(a: boolean, b: boolean): boolean {
  // @ts-ignore
  return 1 - a * b;
}

export const true16: StaticArray<boolean> = [true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true];
export const false16: StaticArray<boolean> = [false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false];
export const one16: StaticArray<boolean> = [false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, true];

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