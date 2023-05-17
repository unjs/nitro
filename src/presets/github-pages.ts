import fsp from "node:fs/promises";
import { join } from "pathe";
import { defineNitroPreset } from "../preset";

export const githubPages = defineNitroPreset({
  extends: "static",
  commands: {
    deploy: "npx gh-pages -d ./public",
  },
  prerender: {
    routes: [
      // https://docs.github.com/en/pages/getting-started-with-github-pages/creating-a-custom-404-page-for-your-github-pages-site
      "/404.html",
    ],
  },
  hooks: {
    async compiled(nitro) {
      await fsp.writeFile(
        join(nitro.options.output.publicDir, ".nojekyll"),
        ""
      );
    },
  },
});
