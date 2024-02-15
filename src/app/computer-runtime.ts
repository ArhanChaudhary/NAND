import runtimeInit, { startRuntime } from "nand-core";
self.postMessage({ action: "loaded" });
self.onmessage = async (e) => {
  await runtimeInit(e.data.wasmModule, e.data.wasmMemory);
  self.onmessage = () => startRuntime();
  self.postMessage({ action: "ready" });
};
