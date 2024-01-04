import { writable, type Writable } from "svelte/store";
export const runner = writable(null);
export const IDEContext: Writable<Array<{ fileName: string; file: string[] }>> =
  writable([]);
export const shouldResetAndStart = writable(true);
export const activeTabName = writable(null);
