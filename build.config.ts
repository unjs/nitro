import { defineBuildConfig } from "unbuild";
import { normalize } from "pathe";

export default defineBuildConfig({
  declaration: true,
  name: "nitro",
  entries: [
    "src/index",
    "src/config",
    "src/cli/index",
    { input: "src/runtime/", outDir: "dist/runtime", format: "esm" },
  ],
  rollup: {
    output: {
      chunkFileNames(chunk) {
        const id = normalize(chunk.moduleIds.at(-1));
        if (id.includes("/src/cli/")) {
          return "cli/[name].mjs";
        }
        if (id.endsWith("/nitro.ts")) {
          return "nitro.mjs";
        }
        return "chunks/[name].mjs";
      },
    },
  },
  externals: ["@nuxt/schema", "firebase-functions"],
});
