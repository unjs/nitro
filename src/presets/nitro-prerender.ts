import { defineNitroPreset } from "../preset";

export const nitroPrerender = defineNitroPreset({
  extends: "node",
  serveStatic: true,
  entry: "#internal/nitro/entries/nitro-prerenderer",
  output: {
    serverDir: "{{ buildDir }}/prerender",
  },
  externals: { trace: false },
});
