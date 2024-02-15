import runtimeInit, { computerStart } from "nand-core";
self.postMessage({ action: "loaded" });
self.onmessage = async (e) => {
  await runtimeInit(e.data.wasmModule, e.data.wasmMemory);
  self.onmessage = () => computerStart();
  self.postMessage({ action: "ready" });
};
