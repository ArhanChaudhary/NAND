import computer_init, { render as computer_render } from "core";

let ctx: OffscreenCanvasRenderingContext2D;
self.onmessage = (e) => {
  let initialized = computer_init(e.data.wasm_module, e.data.wasm_memory);
  ctx = e.data.canvas.getContext("2d", {
    alpha: false,
    desynchronized: true,
  });

  self.onmessage = async () => {
    await initialized;
    switch (e.data.action) {
      case "startRendering":
        startRendering();
        break;
      case "stopRendering":
        stopRendering();
        break;
    }
  };
};

let stopRenderingLoop = false;
function renderer() {
  if (stopRenderingLoop) {
    stopRenderingLoop = false;
  } else {
    // self.requestAnimationFrame(render);
    setTimeout(renderer, 16);
  }
  ctx.putImageData(computer_render(), 0, 0);
}

function startRendering() {
  // self.requestAnimationFrame(render);
  setTimeout(renderer, 16);
}

function stopRendering() {
  stopRenderingLoop = true;
}

self.postMessage({ action: "ready" });
