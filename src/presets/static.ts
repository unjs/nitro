import { defineNitroPreset } from "../preset";

export const _static = defineNitroPreset({
  build: false,
  output: {
    dir: "{{ rootDir }}/.output",
    publicDir: "{{ output.dir }}/public",
  },
  prerender: {
    crawlLinks: true,
    routes: ["/404.html"],
  },
  commands: {
    preview: "npx serve ./public",
  },
});
