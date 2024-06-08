import { defineBuildConfig } from "unbuild";
import { resolve } from "pathe";
import { fileURLToPath } from "node:url";
import { normalize } from "pathe";

const srcDir = fileURLToPath(new URL("src", import.meta.url));

export const subpaths = [
  "cli",
  "config",
  "core",
  "kit",
  "presets",
  "rollup",
  "types",
  "meta",
];

export default defineBuildConfig({
  declaration: true,
  name: "nitro",
  entries: [
    // CLI
    { input: "src/cli/index.ts" },
    // Config
    { input: "src/config/index.ts" },
    // Core
    { input: "src/core/index.ts" },
    // Runtime
    { input: "src/runtime/", outDir: "dist/runtime", format: "esm" },
    // Kit
    { input: "src/kit/index.ts" },
    // Meta
    { input: "src/meta/index.ts" },
    // Presets
    { input: "src/presets/", outDir: "dist/presets", format: "esm" },
    // Rollup
    { input: "src/rollup/index.ts" },
    // Types
    { input: "src/types/index.ts" },
  ],
  alias: {
    nitropack: "nitropack",
    "nitropack/meta": resolve(srcDir, "../meta.ts"),
    "nitropack/runtime/meta": resolve(srcDir, "../runtime-meta.mjs"),
    ...Object.fromEntries(
      subpaths.map((subpath) => [
        `nitropack/${subpath}`,
        resolve(srcDir, `${subpath}/index.ts`),
      ])
    ),
  },
  externals: [
    "nitropack",
    "nitropack/runtime/meta",
    ...subpaths.map((subpath) => `nitropack/${subpath}`),
    "firebase-functions",
    "@scalar/api-reference",
  ],
  rollup: {
    output: {
      chunkFileNames(chunk) {
        const id = normalize(chunk.moduleIds.at(-1));
        if (id.includes("/src/cli/")) {
          return "cli/[name].mjs";
        }
        return "_chunks/[name].mjs";
      },
    },
  },
});
