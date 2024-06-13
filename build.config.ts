import { defineBuildConfig } from "unbuild";
import { resolve } from "pathe";
import { fileURLToPath } from "node:url";
import { normalize } from "pathe";
import { writeFile } from "node:fs/promises";

const srcDir = fileURLToPath(new URL("src", import.meta.url));

export const subpaths = [
  "cli",
  "config",
  "core",
  "kit",
  "presets",
  "rollup",
  "runtime",
  "meta",
  "types",
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
    "nitro/meta": resolve(srcDir, "../meta.ts"),
    "nitro/runtime/meta": resolve(srcDir, "../runtime-meta.mjs"),
    ...Object.fromEntries(
      subpaths.map((subpath) => [
        `nitro/${subpath}`,
        resolve(srcDir, `${subpath}/index.ts`),
      ])
    ),
  },
  hooks: {
    async "build:prepare"(ctx) {
      for (const subpath of subpaths) {
        await writeFile(
          `./${subpath}.d.ts`,
          `export * from "./dist/${subpath}/index";`
        );
      }
    },
  },
  externals: [
    "nitro",
    "nitro/runtime/meta",
    ...subpaths.map((subpath) => `nitro/${subpath}`),
    "firebase-functions",
    "@scalar/api-reference",
  ],
  rollup: {
    output: {
      chunkFileNames(chunk: any) {
        const id = normalize(chunk.moduleIds.at(-1));
        if (id.includes("/src/cli/")) {
          return "cli/[name].mjs";
        }
        return "_chunks/[name].mjs";
      },
    },
  },
});
