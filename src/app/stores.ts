import { writable } from "svelte/store";
export const IDEContext = writable<Array<{ fileName: string; file: string[] }>>(
  JSON.parse(localStorage.getItem("IDEContext") as string) || []
);
export const shouldResetAndStart = writable(true);
export const activeTabName = writable<null | string>(null);
