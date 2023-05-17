import { defineNitroPreset } from "../preset";

export const _static = defineNitroPreset({
  static: true,
  output: {
    dir: "{{ rootDir }}/.output",
    publicDir: "{{ output.dir }}/public",
  },
  prerender: {
    crawlLinks: true,
  },
  commands: {
    preview: "npx serve ./public",
  },
});
