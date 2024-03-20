import { writable } from "svelte/store";
export const IDEContext = writable<Array<{ fileName: string; file: string[] }>>(
  JSON.parse(localStorage.getItem("IDEContext") as string) || []
);
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
export const ROM = writable<{
  machineCode: string[];
  assembly: string[];
  VMCodes: { fileName: string; VMCode: string[] }[];
}>({
  machineCode: new Array(32768).fill("00000000 00000000"),
  assembly: new Array(32768).fill("@0"),
  VMCodes: [],
});
