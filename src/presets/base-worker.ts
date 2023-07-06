import { defineNitroPreset } from "../preset";
import { workerExportConditions } from "../utils/export-conditions";

export const baseWorker = defineNitroPreset({
  entry: null, // Abstract
  exportConditions: workerExportConditions,
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
