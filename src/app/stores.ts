import { writable } from "svelte/store";
import type { CompilerError } from "../compiler/exceptions";
export const IDEContext = writable<{ fileName: string; file: string[] }[]>(
  JSON.parse(localStorage.getItem("IDEContext") as string) || []
);
export const computerIsRunning = writable<boolean | null>(null);
export const shouldResetAndStart = writable(true);
export const activeTabName = writable<null | string>(null);
export const computerMemory = writable({
  ramMemory: new Uint16Array(16384),
  screenMemory: new Uint16Array(8192),
  pressedKey: 0,
  pcRegister: 0,
  aRegister: 0,
  dRegister: 0,
});
export const ROM = writable({
  machineCode: new Array<string>(),
  assembly: new Array<string>(),
  VMCodes: new Array<{ fileName: string; VMCode: string[] }>(),
});
export const compilerError = writable<null | CompilerError>(null);
