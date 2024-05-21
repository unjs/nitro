import { defineBuildConfig } from "unbuild";
import { resolve, normalize } from "pathe";
import { fileURLToPath } from "node:url";

const srcDir = fileURLToPath(new URL("src", import.meta.url));

export default defineBuildConfig({
  declaration: true,
  name: "nitro",
  entries: [
    "src/index",
    "src/config",
    "src/cli/index",
    { input: "src/presets/", outDir: "dist/presets", format: "esm" },
    { input: "src/runtime/", outDir: "dist/runtime", format: "esm" },
  ],
  alias: {
    nitropack: resolve(srcDir, "index.ts"),
    "nitropack/": srcDir,
    "nitropack/presets": resolve(srcDir, "presets/index.ts"),
    "nitropack/presets/": resolve(srcDir, "presets"),
  },
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
  externals: [
    "nitropack",
    "nitropack/presets",
    "firebase-functions",
    "@scalar/api-reference",
  ],
});
