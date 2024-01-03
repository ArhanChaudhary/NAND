import { writable, type Writable } from "svelte/store";
export const ide_context: Writable<
  Array<{ fileName: string; file: string[] }>
> = writable([]);
