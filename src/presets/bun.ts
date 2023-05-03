import { defineNitroPreset } from "../preset";

export const bun = defineNitroPreset({
  entry: "#internal/nitro/entries/bun",
  node: false,
  noExternals: true,
  serveStatic: "bun",
  commands: {
    preview: "bun run ./server/index.ts",
    deploy: "",
  },
  rollupConfig: {
    preserveEntrySignatures: false,
    output: {
      entryFileNames: "index.ts",
      manualChunks: () => "index",
      format: "esm",
    },
  },
});
