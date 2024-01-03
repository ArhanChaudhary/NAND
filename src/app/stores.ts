import { writable, type Writable } from "svelte/store";
export const runner = writable(null);
export const ide_context: Writable<
  Array<{ fileName: string; file: string[] }>
> = writable([]);
