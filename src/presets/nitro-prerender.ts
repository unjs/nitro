import { defineNitroPreset } from "../preset";

export const nitroPrerender = defineNitroPreset({
  extends: "node",
  entry: "#internal/nitro/entries/nitro-prerenderer",
  output: {
    serverDir: "{{ buildDir }}/prerender",
  },
  externals: { trace: false },
});
