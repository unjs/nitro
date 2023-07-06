import { builtinModules } from "node:module";
import { isAbsolute, resolve } from "pathe";
import MagicString from "magic-string";
import { findStaticImports } from "mlly";
import inject from "@rollup/plugin-inject";
import { defineNitroPreset } from "../preset";
import { writeFile } from "../utils";
import { ImportMetaRe } from "../rollup/plugins/import-meta";
import {
  exportConditions,
  workerExportConditions,
} from "../utils/export-conditions";

export const denoServer = defineNitroPreset({
  extends: "node-server",
  entry: "#internal/nitro/entries/deno-server",
  exportConditions: exportConditions("deno", workerExportConditions),
  commands: {
    preview: "deno task --config ./deno.json start",
  },
  rollupConfig: {
    output: {
      hoistTransitiveImports: false,
    },
    plugins: [
      inject({
        modules: {
          process: "process",
          global: "global",
          Buffer: ["buffer", "Buffer"],
          setTimeout: ["timers", "setTimeout"],
          clearTimeout: ["timers", "clearTimeout"],
          setInterval: ["timers", "setInterval"],
          clearInterval: ["timers", "clearInterval"],
          setImmediate: ["timers", "setImmediate"],
          clearImmediate: ["timers", "clearImmediate"],
        },
      }),
      {
        name: "rollup-plugin-node-deno",
        resolveId(id) {
          id = id.replace("node:", "");
          if (builtinModules.includes(id)) {
            return {
              id: `node:${id}`,
              moduleSideEffects: false,
              external: true,
            };
          }
          if (isHTTPImport(id)) {
            return {
              id,
              external: true,
            };
          }
        },
        renderChunk(code) {
          const s = new MagicString(code);
          const imports = findStaticImports(code);
          for (const i of imports) {
            if (
              !i.specifier.startsWith(".") &&
              !isAbsolute(i.specifier) &&
              !isHTTPImport(i.specifier) &&
              !i.specifier.startsWith("npm:")
            ) {
              const specifier = i.specifier.replace("node:", "");
              s.replace(
                i.code,
                i.code.replace(
                  new RegExp(`(?<quote>['"])${i.specifier}\\k<quote>`),
                  JSON.stringify(
                    builtinModules.includes(specifier)
                      ? "node:" + specifier
                      : "npm:" + specifier
                  )
                )
              );
            }
          }
          if (s.hasChanged()) {
            return {
              code: s.toString(),
              map: s.generateMap({ includeContent: true }),
            };
          }
        },
      },
      {
        name: "inject-process",
        renderChunk: {
          order: "post",
          handler(code, chunk) {
            if (
              !chunk.isEntry &&
              (!ImportMetaRe.test(code) || code.includes("ROLLUP_NO_REPLACE"))
            ) {
              return;
            }

            const s = new MagicString(code);
            s.prepend("import process from 'node:process';");

            return {
              code: s.toString(),
              map: s.generateMap({ includeContent: true }),
            };
          },
        },
      },
    ],
  },
  hooks: {
    async compiled(nitro) {
      // https://deno.com/manual@v1.34.3/getting_started/configuration_file
      const denoJSON = {
        tasks: {
          start:
            "deno run --unstable --allow-net --allow-read --allow-env ./server/index.mjs",
        },
      };
      await writeFile(
        resolve(nitro.options.output.dir, "deno.json"),
        JSON.stringify(denoJSON, null, 2)
      );
    },
  },
});

const HTTP_IMPORT_RE = /^(https?:)?\/\//;

function isHTTPImport(id: string) {
  return HTTP_IMPORT_RE.test(id);
}
