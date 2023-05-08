import { defineNitroPreset } from "../preset";

export const bun = defineNitroPreset({
  entry: "#internal/nitro/entries/bun",
  // https://bun.sh/docs/runtime/nodejs-apis
  // node: false,
  serveStatic: "bun",
  commands: {
    preview: "bun run ./server/index.js",
  },
  rollupConfig: {
    preserveEntrySignatures: false,
    output: {
      entryFileNames: "index.js",
      format: "esm",
    },
  },
});
