import { defineNitroPreset } from "../preset";

export const nitroDev = defineNitroPreset({
  extends: "node",
  entry: "#internal/nitro/entries/nitro-dev",
  exportConditions: ["default", "development", "module", "node", "import"],
  output: {
    serverDir: "{{ buildDir }}/dev",
  },
  externals: { trace: false },
  inlineDynamicImports: true, // externals plugin limitation
  sourceMap: true,
});
