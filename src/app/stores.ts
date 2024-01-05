import { writable } from "svelte/store";
export const runner = writable(null);
export const IDEContext = writable<Array<{ fileName: string; file: string[] }>>(
  JSON.parse(localStorage.getItem("IDEContext")) || []
);
export const shouldResetAndStart = writable(true);
export const activeTabName = writable(null);
