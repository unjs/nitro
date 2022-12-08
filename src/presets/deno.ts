import { defineNitroPreset } from "../preset";

export const deno = defineNitroPreset({
  entry: "#internal/nitro/entries/deno",
  node: false,
  noExternals: true,
  serveStatic: "deno",
  commands: {
    preview: "",
    deploy:
      "cd ./ && deployctl deploy --project=<project_name> server/index.ts",
  },
  rollupConfig: {
    preserveEntrySignatures: false,
    external: ["https://deno.land/std/http/server.ts"],
    output: {
      entryFileNames: "index.ts",
      manualChunks: () => "index",
      format: "esm",
    },
  },
});
