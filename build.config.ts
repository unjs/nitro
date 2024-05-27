import { defineBuildConfig } from "unbuild";
import { resolve, normalize } from "pathe";
import { fileURLToPath } from "node:url";

const srcDir = fileURLToPath(new URL("src", import.meta.url));

export default defineBuildConfig({
  declaration: true,
  name: "nitro",
  entries: [
    // CLI
    { input: "src/cli/index.ts" },
    // Presets
    { input: "src/presets/", outDir: "dist/presets", format: "esm" },
    // Core
    { input: "src/core/index.ts" },
    { input: "src/core/runtime/", outDir: "dist/core/runtime", format: "esm" },
    // Rollup
    { input: "src/rollup/index.ts" },
    // Kit
    { input: "src/kit/index.ts" },
    // Schema
    { input: "src/schema/index.ts" },
  ],
  alias: {
    "nitropack": "./src/core/index.ts",
    ...Object.fromEntries(
      ["core", "rollup", "kit", "schema", "presets"].map(pkg => [`nitropack/${pkg}`, resolve(srcDir, `${pkg}/index.ts`)])
    )
  },
  rollup: {
    output: {
      // chunkFileNames(chunk) {
      //   const id = normalize(chunk.moduleIds.at(-1));
      //   if (id.includes("/src/cli/")) {
      //     return "cli/[name].mjs";
      //   }
      //   if (id.endsWith("/nitro.ts")) {
      //     return "nitro.mjs";
      //   }
      //   return "chunks/[name].mjs";
      // },
    },
  },
  externals: [
    "nitropack",
    "nitropack/presets",
    "nitropack/core",
    "nitropack/schema",
    "nitropack/kit",
    "firebase-functions",
    "@scalar/api-reference",
  ],
});
