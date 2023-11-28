import { createHash } from "node:crypto";
import { promises as fs, existsSync } from "node:fs";
import { basename, normalize } from "pathe";
import type { Plugin } from "rollup";
import wasmBundle from "@rollup/plugin-wasm";
import { isWindows } from "std-env";
import MagicString from "magic-string";
import { walk } from "estree-walker";
import { filename } from "pathe/utils";
import { WasmOptions } from "../../types";

export function wasm(options: WasmOptions): Plugin {
  return options.esmImport ? wasmImport() : wasmBundle(options.rollup);
}

const WASM_IMPORT_PREFIX = "\0nitro:wasm/";

export function wasmImport(): Plugin {
  type WasmAssetInfo = {
    fileName: string;
    id: string;
    source: Buffer;
    hash: string;
  };

  const wasmSources = new Map<string /* sourceFile */, WasmAssetInfo>();
  const wasmImports = new Map<string /* id */, WasmAssetInfo>();
  const wasmGlobals = new Map<string /* global id */, WasmAssetInfo>();

  return <Plugin>{
    name: "nitro:wasm",
    async resolveId(id, importer, options) {
      // Only handle .wasm imports
      if (!id.endsWith(".wasm")) {
        return null;
      }

      // Resolve the source file real path
      const sourceFile = await this.resolve(id, importer, options).then((r) =>
        r?.id ? normalize(r.id) : null
      );
      if (!sourceFile || !existsSync(sourceFile)) {
        return null;
      }

      // Read (cached) Asset
      let wasmAsset: WasmAssetInfo | undefined = wasmSources.get(sourceFile);
      if (!wasmAsset) {
        wasmAsset = {
          id: WASM_IMPORT_PREFIX + sourceFile,
          fileName: "",
          source: undefined,
          hash: "",
        };
        wasmSources.set(sourceFile, wasmAsset);
        wasmImports.set(wasmAsset.id, wasmAsset);

        wasmAsset.source = await fs.readFile(sourceFile);
        wasmAsset.hash = sha1(wasmAsset.source);
        const _baseName = basename(sourceFile, ".wasm");
        wasmAsset.fileName = `wasm/${_baseName}-${wasmAsset.hash}.wasm`;

        await this.emitFile({
          type: "asset",
          source: wasmAsset.source,
          fileName: wasmAsset.fileName,
        });
      }

      // Resolve as external
      return {
        id: wasmAsset.id,
        attributes: { name: "foobar" },
        meta: { name: "foobar" },
        external: true,
      };
    },
    renderChunk(code, chunk, options) {
      if (!code.includes(WASM_IMPORT_PREFIX)) {
        return null;
      }

      const s = new MagicString(code);

      const resolveImport = (specifier?: string) => {
        if (
          typeof specifier !== "string" ||
          !specifier.startsWith(WASM_IMPORT_PREFIX)
        ) {
          return null;
        }
        const asset = wasmImports.get(specifier);
        if (!asset) {
          return null;
        }
        const nestedLevel = chunk.fileName.split("/").length - 1;
        return (
          (nestedLevel ? "../".repeat(nestedLevel) : "./") + asset.fileName
        );
      };

      walk(this.parse(code) as any, {
        enter(node, parent, prop, index) {
          if (
            // prettier-ignore
            (node.type === "ImportDeclaration" || node.type === "ImportExpression") &&
            "value" in node.source && typeof node.source.value === "string" &&
            "start" in node.source && typeof node.source.start === "number" &&
            "end" in node.source && typeof node.source.end === "number"
          ) {
            const resolved = resolveImport(node.source.value);
            if (resolved) {
              // prettier-ignore
              s.update(node.source.start, node.source.end, JSON.stringify(resolved));
            }
          }
        },
      });
      return {
        code: s.toString(),
        map: s.generateMap({ includeContent: true }),
      };
    },
    // --- [temporary] IIFE/UMD support for cloudflare (non module targets) ---
    renderStart(options) {
      if (options.format === "iife" || options.format === "umd") {
        for (const [importName, wasmAsset] of wasmImports.entries()) {
          if (!(importName in options.globals)) {
            const globalName = `_wasm_${wasmAsset.hash}`;
            wasmGlobals.set(globalName, wasmAsset);
            options.globals[importName] = globalName;
          }
        }
      }
    },
    generateBundle(options, bundle) {
      if (wasmGlobals.size > 0) {
        for (const [fileName, chunkInfo] of Object.entries(bundle)) {
          if (chunkInfo.type !== "chunk" || !chunkInfo.isEntry) {
            continue;
          }
          const imports: string[] = [];
          for (const [globalName, wasmAsset] of wasmGlobals.entries()) {
            if (chunkInfo.code.includes(globalName)) {
              imports.push(
                `import ${globalName} from "${wasmAsset.fileName}";`
              );
            }
          }
          if (imports.length > 0) {
            chunkInfo.code = imports.join("\n") + "\n" + chunkInfo.code;
          }
        }
      }
    },
  };
}

function sha1(source: Buffer) {
  return createHash("sha1").update(source).digest("hex").slice(0, 16);
}
