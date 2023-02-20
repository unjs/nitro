import type { PackageJson } from "pkg-types";
import { resolve } from "pathe";
import { defineNitroPreset } from "../preset";
import { writeFile } from "../utils";

export const lagon = defineNitroPreset({
  extends: "base-worker",
  entry: "#internal/nitro/entries/lagon",
  commands: {
    preview: "npm run dev --prefix ./",
    deploy: "npm run deploy --prefix ./",
  },
  rollupConfig: {
    output: {
      entryFileNames: "index.mjs",
      format: "esm",
    },
  },

  hooks: {
    async compiled(nitro) {
      // TODO: write lagon config when it's supported

      // Write package.json for deployment
      await writeFile(
        resolve(nitro.options.output.dir, "package.json"),
        JSON.stringify(
          <PackageJson>{
            private: true,
            scripts: {
              dev: "npx -p esbuild -p @lagon/cli lagon dev ./server/index.mjs -p ./public",
              deploy:
                "npx -p esbuild -p @lagon/cli lagon deploy ./server/index.mjs -p ./public",
            },
          },
          null,
          2
        )
      );
    },
  },
});
