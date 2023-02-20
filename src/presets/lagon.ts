import { defineNitroPreset } from "../preset";

export const lagon = defineNitroPreset({
  extends: "base-worker",
  entry: "#internal/nitro/entries/lagon",
  commands: {
    preview:
      "npx -p esbuild -p @lagon/cli lagon dev ./server/index.mjs -p ./public",
    deploy:
      "npx -p esbuild -p @lagon/cli lagon deploy ./server/index.mjs -p ./public",
  },
  rollupConfig: {
    output: {
      entryFileNames: "index.mjs",
      format: "esm",
    },
  },
  // TODO: write lagon config when it's supported
  // hooks: {
  //   async compiled(nitro) {},
  // },
});
