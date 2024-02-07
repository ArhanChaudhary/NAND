import { defineConfig } from "vite";
import wasm from "vite-plugin-wasm";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import { VitePWA } from "vite-plugin-pwa";
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
    VitePWA({
      manifest: {
        name: "NAND",
        short_name: "NAND",
        display: "fullscreen",
        theme_color: "black",
        background_color: "hsl(0, 0%, 83%)",
        icons: [
          {
            src: "/favicon.ico",
            sizes: "450x450",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "/favicon-maskable.png",
            sizes: "570x570",
            type: "image/png",
            purpose: "maskable",
          },
        ],
      },
    }),
    svelte({ preprocess: sveltePreprocess({ postcss: true }) }),
    topLevelAwait(),
  ],
  worker: {
    plugins: () => [wasm(), topLevelAwait()],
  },
});
