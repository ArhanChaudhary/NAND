import { defineConfig } from "vite";
import wasm from "vite-plugin-wasm";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import sveltePreprocess from "svelte-preprocess";
import topLevelAwait from "vite-plugin-top-level-await";

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    headers: {
      "Cross-Origin-Embedder-Policy": "require-corp",
      "Cross-Origin-Opener-Policy": "same-origin",
    },
  },
  plugins: [
    wasm(),
    svelte({ preprocess: sveltePreprocess({ postcss: true }) }),
    topLevelAwait(),
  ],
  worker: {
    plugins: () => [wasm(), topLevelAwait()],
  },
  build: {
    rollupOptions: {
      input: {
        main: "index.html", // This should be the entry HTML file for your app
        "computer-runner": "app/computer-runner.ts",
        "computer-screen": "app/screen.ts", // Adjust the path accordingly
      },
    },
  },
});
