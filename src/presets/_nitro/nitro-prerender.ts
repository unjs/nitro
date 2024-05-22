import { defineNitroPreset } from "nitropack";

const nitroPrerender = defineNitroPreset(
  {
    extends: "node",
    serveStatic: true,
    entry: "./runtime/nitro-prerenderer",
    output: {
      serverDir: "{{ buildDir }}/prerender",
    },
    externals: { trace: false },
    rollupConfig: {
      output: {
        entryFileNames: "index.mjs",
      },
    },
  },
  {
    name: "nitro-prerender" as const,
    url: import.meta.url,
  }
);

export default [nitroPrerender] as const;
