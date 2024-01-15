import computer_init, { render as computer_render } from "core";

self.onmessage = (e) => {
  let initialized = computer_init(e.data.wasm_module, e.data.wasm_memory);
  let ctx = e.data.canvas.getContext("2d", {
    alpha: false,
    desynchronized: true,
  });

  self.onmessage = async () => {
    await initialized;
    ctx.putImageData(computer_render(), 0, 0);
  };
};

self.postMessage("ready");
