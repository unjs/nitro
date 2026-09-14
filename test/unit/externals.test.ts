import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "pathe";
import { describe, expect, it } from "vitest";
import {
  applyProductionCondition,
  externals,
} from "../../src/rollup/plugins/externals";

describe("externals:applyProductionCondition", () => {
  const applyProductionConditionCases = [
    {
      name: "vue-router@4.1.6",
      in: {
        ".": {
          types: "./dist/vue-router.d.ts",
          node: {
            import: {
              production: "./dist/vue-router.node.mjs",
              development: "./dist/vue-router.node.mjs",
              default: "./dist/vue-router.node.mjs",
            },
            require: {
              production: "./dist/vue-router.prod.cjs",
              development: "./dist/vue-router.cjs",
              default: "./index.js",
            },
          },
          import: "./dist/vue-router.mjs",
          require: "./index.js",
        },
        "./dist/*": "./dist/*",
        "./vetur/*": "./vetur/*",
        "./package.json": "./package.json",
      },
      out: {
        ".": {
          types: "./dist/vue-router.d.ts",
          node: {
            import: {
              production: "./dist/vue-router.node.mjs",
              development: "./dist/vue-router.node.mjs",
              default: "./dist/vue-router.node.mjs",
            },
            require: {
              production: "./dist/vue-router.prod.cjs",
              development: "./dist/vue-router.cjs",
              default: "./dist/vue-router.prod.cjs",
            },
          },
          import: "./dist/vue-router.mjs",
          require: "./index.js",
        },
        "./dist/*": "./dist/*",
        "./vetur/*": "./vetur/*",
        "./package.json": "./package.json",
      },
    },
    {
      name: "fluent-vue@3.2.0",
      in: {
        ".": {
          production: {
            require: "./dist/prod/index.cjs",
            import: "./dist/prod/index.mjs",
          },
          types: "./index.d.ts",
          require: "./dist/index.cjs",
          import: "./dist/index.mjs",
        },
      },
      out: {
        ".": {
          import: "./dist/prod/index.mjs",
          production: {
            import: "./dist/prod/index.mjs",
            require: "./dist/prod/index.cjs",
          },
          require: "./dist/prod/index.cjs",
          types: "./index.d.ts",
        },
      },
    },
  ];
  for (const t of applyProductionConditionCases) {
    it(t.name, () => {
      applyProductionCondition(t.in as any);
      expect(t.in).toEqual(t.out);
    });
  }
});

describe("externals:resolveId", () => {
  // A package whose root export resolves to a different file than the one
  // rollup hands us, plus a wildcard key so a trailing-slash subpath would
  // match a deprecated pattern.
  function setupFixture() {
    const rootDir = mkdtempSync(join(tmpdir(), "nitro-externals-"));
    const pkgDir = join(rootDir, "node_modules", "@scope", "pkg");
    mkdirSync(join(pkgDir, "dist"), { recursive: true });
    writeFileSync(
      join(pkgDir, "package.json"),
      JSON.stringify({
        name: "@scope/pkg",
        version: "1.0.0",
        type: "module",
        exports: {
          ".": {
            node: {
              production: "./dist/index.prod.js",
              default: "./dist/index.js",
            },
            default: "./dist/index.js",
          },
          "./*": "./*",
        },
      })
    );
    writeFileSync(join(pkgDir, "dist", "index.js"), "export const a = 1;\n");
    writeFileSync(
      join(pkgDir, "dist", "index.prod.js"),
      "export const a = 1;\n"
    );
    writeFileSync(join(rootDir, "importer.mjs"), "");
    return { rootDir, pkgDir };
  }

  it("does not build a trailing-slash specifier for a root export", async () => {
    const { rootDir, pkgDir } = setupFixture();
    const plugin = externals({
      outDir: join(rootDir, ".output"),
      rootDir,
      moduleDirectories: [join(rootDir, "node_modules")],
      exportConditions: ["node", "import", "production"],
    }) as any;

    const warnings: string[] = [];
    const originalEmitWarning = process.emitWarning;
    process.emitWarning = ((warning: any, ...args: any[]) => {
      warnings.push(String(warning));
      return originalEmitWarning.call(process, warning, ...(args as [any]));
    }) as typeof process.emitWarning;

    try {
      const id = join(pkgDir, "dist", "index.js");
      await plugin.resolveId.call(
        { resolve: async (resolvedId: string) => ({ id: resolvedId }) },
        id,
        join(rootDir, "importer.mjs"),
        {}
      );
    } finally {
      process.emitWarning = originalEmitWarning;
    }

    // Joining the "./" root subpath used to produce "@scope/pkg/", a
    // deprecated exports pattern (DEP0155).
    expect(warnings.filter((w) => w.includes("trailing slash"))).toEqual([]);
  });
});
