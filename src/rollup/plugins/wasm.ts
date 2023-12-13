import { createHash } from "node:crypto";
import { promises as fs, existsSync } from "node:fs";
import { basename, normalize } from "pathe";
import type { Plugin } from "rollup";
import wasmBundle from "@rollup/plugin-wasm";
import MagicString from "magic-string";
import { WasmOptions } from "../../types";

export function wasm(options: WasmOptions): Plugin {
  return options.esmImport ? wasmImport() : wasmBundle(options.rollup);
}

const WASM_ID_PREFIX = "\0nitro:wasm/";

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
      if (id.startsWith(WASM_ID_PREFIX)) {
        return id;
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
          id: WASM_ID_PREFIX + sourceFile,
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

      return { id: wasmAsset.id };
    },
    load(id) {
      if (!id.startsWith(WASM_ID_PREFIX)) {
        return null;
      }
      const asset = wasmImports.get(id);
      if (asset) {
        return {
          code: `export default "${asset.id}";`,
          map: null,
        };
      }
    },
    renderChunk(code, chunk, options) {
      if (
        !chunk.moduleIds.some((id) => id.startsWith(WASM_ID_PREFIX)) ||
        !code.includes(WASM_ID_PREFIX)
      ) {
        return null;
      }

      const isIIFE = options.format === "iife" || options.format === "umd"

      const s = new MagicString(code);
      const ReplaceRE = new RegExp(`"(${WASM_ID_PREFIX}[^"]+)"`, "g");
      const resolveImport = (id) => {
        if (typeof id !== "string" || !id.startsWith(WASM_ID_PREFIX)) {
          return null;
        }
        const asset = wasmImports.get(id);
        if (!asset) {
          return null;
        }
        const nestedLevel = chunk.fileName.split("/").length - 1;
        return (
          (nestedLevel ? "../".repeat(nestedLevel) : "./") + asset.fileName
        );
      };
      for (const match of code.matchAll(ReplaceRE)) {
        const resolved = resolveImport(match[1]);
        if (!resolved) {
          console.warn(
            `Failed to resolve WASM import: ${JSON.stringify(match[1])}`
          );
          continue;
        }
        let code = `await import("${resolved}").then(r => r?.default || r);`
        if (isIIFE) {
          code = `undefined /* not supported */`
        }
        s.overwrite(match.index, match.index + match[0].length, code);
      }
      if (s.hasChanged()) {
        return {
          code: s.toString(),
          map: s.generateMap({ includeContent: true }),
        };
      }
    },
  };
}

function sha1(source: Buffer) {
  return createHash("sha1").update(source).digest("hex").slice(0, 16);
}
