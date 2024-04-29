import { defineNitroPreset } from "../preset";

export const baseWorker = defineNitroPreset({
  entry: null as any, // Abstract
  node: false,
  minify: true,
  noExternals: true,
  rollupConfig: {
    output: {
      format: "iife",
      generatedCode: {
        symbols: true,
      },
    },
  },
  inlineDynamicImports: true, // iffe does not support code-splitting
});
