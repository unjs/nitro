import { defineNitroPreset } from "../preset";

export const denoDeploy = defineNitroPreset({
  entry: "#internal/nitro/entries/deno-deploy",
  exportConditions: ["deno"],
  node: false,
  noExternals: true,
  serveStatic: "deno",
  commands: {
    preview: "",
    deploy:
      "cd ./ && deployctl deploy --project=<project_name> server/index.ts",
  },
  unenv: {
    polyfill: ["#internal/nitro/polyfill/deno-env"],
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

export const deno = denoDeploy;
