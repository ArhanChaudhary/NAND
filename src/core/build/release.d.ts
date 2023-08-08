/** Exported memory */
export declare const memory: WebAssembly.Memory;
/**
 * assembly/architecture/CPU
 * @param inM `u16`
 * @param instruction `u16`
 * @param reset `bool`
 * @returns `~lib/staticarray/StaticArray<u16>`
 */
export declare function CPU(inM: number, instruction: number, reset: boolean): ArrayLike<number>;
/**
 * assembly/architecture/step
 * @param reset `bool`
 */
export declare function step(reset?: boolean): void;
/**
 * assembly/builtins/NAND
 * @param a `bool`
 * @param b `bool`
 * @returns `bool`
 */
export declare function NAND(a: boolean, b: boolean): boolean;
/**
 * assembly/builtins/tick
 */
export declare function tick(): void;
/**
 * assembly/builtins/tock
 */
export declare function tock(): void;
/**
 * assembly/builtins/nBit16
 * @param n `u16`
 * @param i `u8`
 * @returns `bool`
 */
export declare function nBit16(n: number, i: number): boolean;
/**
 * assembly/builtins/nBit16_0
 * @param n `u16`
 * @returns `bool`
 */
export declare function nBit16_0(n: number): boolean;
/**
 * assembly/builtins/word16_16
 * @param a `bool`
 * @param b `bool`
 * @param c `bool`
 * @param d `bool`
 * @param e `bool`
 * @param f `bool`
 * @param g `bool`
 * @param h `bool`
 * @param i `bool`
 * @param j `bool`
 * @param k `bool`
 * @param l `bool`
 * @param m `bool`
 * @param n `bool`
 * @param o `bool`
 * @param p `bool`
 * @returns `u16`
 */
export declare function word16_16(a: boolean, b: boolean, c: boolean, d: boolean, e: boolean, f: boolean, g: boolean, h: boolean, i: boolean, j: boolean, k: boolean, l: boolean, m: boolean, n: boolean, o: boolean, p: boolean): number;
/**
 * assembly/builtins/slice16_0to12
 * @param n `u16`
 * @returns `u16`
 */
export declare function slice16_0to12(n: number): number;
/**
 * assembly/builtins/slice16_0to14
 * @param n `u16`
 * @returns `u16`
 */
export declare function slice16_0to14(n: number): number;
/**
 * assembly/builtins/slice16_13to14
 * @param n `u16`
 * @returns `u8`
 */
export declare function slice16_13to14(n: number): number;
/**
 * assembly/builtins/PC_reg
 * @param in_ `u16`
 * @returns `u16`
 */
export declare function PC_reg(in_: number): number;
/**
 * assembly/builtins/DRegister
 * @param in_ `u16`
 * @param load `bool`
 * @returns `u16`
 */
export declare function DRegister(in_: number, load: boolean): number;
/**
 * assembly/builtins/ARegister
 * @param in_ `u16`
 * @param load `bool`
 * @returns `u16`
 */
export declare function ARegister(in_: number, load: boolean): number;
/**
 * assembly/builtins/RAM16K
 * @param in_ `u16`
 * @param load `bool`
 * @param address `u16`
 * @returns `u16`
 */
export declare function RAM16K(in_: number, load: boolean, address: number): number;
/**
 * assembly/builtins/ROM32K
 * @param address `u16`
 * @returns `u16`
 */
export declare function ROM32K(address: number): number;
/**
 * assembly/builtins/Screen
 * @param in_ `u16`
 * @param load `bool`
 * @param address `u16`
 * @returns `u16`
 */
export declare function Screen(in_: number, load: boolean, address: number): number;
/**
 * assembly/builtins/Keyboard
 * @param load `bool`
 * @param pressed `u16`
 * @returns `u16`
 */
export declare function Keyboard(load?: boolean, pressed?: number): number;
/**
 * assembly/builtins/loadROM
 * @param in_ `~lib/staticarray/StaticArray<~lib/string/String>`
 */
export declare function loadROM(in_: ArrayLike<string>): void;
/**
 * assembly/builtins/getRAM
 * @returns `~lib/staticarray/StaticArray<u16>`
 */
export declare function getRAM(): ArrayLike<number>;
/**
 * assembly/builtins/getScreen
 * @returns `~lib/staticarray/StaticArray<u16>`
 */
export declare function getScreen(): ArrayLike<number>;
