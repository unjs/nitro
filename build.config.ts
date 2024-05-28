import { defineBuildConfig } from "unbuild";
import { resolve } from "pathe";
import { fileURLToPath } from "node:url";

const srcDir = fileURLToPath(new URL("src", import.meta.url));

export const subpaths = [
  "cli",
  "core",
  "kit",
  "presets",
  "rollup",
  "schema",
  "config",
];

export default defineBuildConfig({
  declaration: true,
  name: "nitro",
  entries: [
    // CLI
    { input: "src/cli/index.ts" },
    // Core
    { input: "src/core/index.ts" },
    // Runtime
    { input: "src/runtime/", outDir: "dist/runtime", format: "esm" },
    // Kit
    { input: "src/kit/index.ts" },
    // Presets
    { input: "src/presets/", outDir: "dist/presets", format: "esm" },
    // Rollup
    { input: "src/rollup/index.ts" },
    // Schema and Config
    { input: "src/schema/index.ts" },
    { input: "src/schema/config.ts" },
  ],
  alias: {
    nitropack: "./src/core/index.ts",
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
    "nitropack/package.json",
    ...subpaths.map((subpath) => `nitropack/${subpath}`),
    "firebase-functions",
    "@scalar/api-reference",
  ],
});
