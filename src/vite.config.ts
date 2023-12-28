import { defineConfig } from "vite";
import wasm from "vite-plugin-wasm";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import sveltePreprocess from "svelte-preprocess";
import topLevelAwait from "vite-plugin-top-level-await";

// https://vitejs.dev/config/
export default defineConfig({
  base: "/NAND",
  plugins: [
    wasm(),
    svelte({ preprocess: sveltePreprocess({ postcss: true }) }),
    topLevelAwait(),
  ],
  worker: {
    plugins: [wasm(), topLevelAwait()],
  },
  build: {
    rollupOptions: {
      input: {
        main: "index.html", // This should be the entry HTML file for your app
        "computer-wrapper": "app/computer-wrapper.ts",
        screen: "app/screen.ts", // Adjust the path accordingly
      },
    },
  },
});
