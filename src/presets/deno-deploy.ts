import { deno as _unenvDenoPreset } from "unenv";
import { defineNitroPreset } from "../preset";

// https://docs.deno.com/runtime/manual/node/compatibility
// https://docs.deno.com/deploy/api/runtime-node

export const denoDeploy = defineNitroPreset({
  entry: "#internal/nitro/entries/deno-deploy",
  exportConditions: ["deno"],
  noExternals: true,
  serveStatic: "deno",
  commands: {
    preview: "",
    deploy:
      "cd ./ && deployctl deploy --project=<project_name> server/index.ts",
  },
  unenv: _unenvDenoPreset,
  rollupConfig: {
    preserveEntrySignatures: false,
    external: (id) => id.startsWith("https://"),
    output: {
      entryFileNames: "index.ts",
      manualChunks: (id) => "index",
      format: "esm",
    },
  },
});

export const deno = denoDeploy;
