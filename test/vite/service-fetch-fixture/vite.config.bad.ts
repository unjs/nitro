import { defineConfig } from "vite";
import { nitro } from "nitro/vite";

export default defineConfig({
  plugins: [nitro({ serverDir: "./", output: { dir: ".output/bad" } })],
  environments: {
    ssr: { build: { rollupOptions: { input: "./app/entry-bad.ts" } } },
  },
});
