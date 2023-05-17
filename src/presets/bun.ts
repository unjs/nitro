import { defineNitroPreset } from "../preset";

export const bun = defineNitroPreset({
  entry: "#internal/nitro/entries/bun",
  serveStatic: "node",
  commands: {
    preview: "bun run ./server/index.mjs",
  },
  rollupConfig: {
    preserveEntrySignatures: false,
    output: {
      entryFileNames: "index.mjs",
      format: "esm",
    },
  },
});
