import { defineNitroPreset } from "../preset";

export const nitroPrerender = defineNitroPreset({
  extends: "node",
  entry: "#internal/nitro/entries/nitro-prerenderer",
  output: {
    serverDir: "{{ buildDir }}/prerender",
  },
  commands: {
    preview: "npx serve ./public",
  },
  externals: { trace: false },
});
