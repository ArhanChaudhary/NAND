import runtimeInit, { tryStartRuntime } from "nand-core";
self.postMessage({ action: "loaded" });
self.onmessage = async (e) => {
  await runtimeInit(e.data.wasmModule, e.data.wasmMemory);
  self.onmessage = () => tryStartRuntime();
  self.postMessage({ action: "ready" });
};
