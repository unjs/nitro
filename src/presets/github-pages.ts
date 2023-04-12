import fsp from "node:fs/promises";
import { join } from "pathe";
import { defineNitroPreset } from "../preset";

export const githubPages = defineNitroPreset({
  extends: "static",
  commands: {
    deploy: "npx gh-pages -d ./public",
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
