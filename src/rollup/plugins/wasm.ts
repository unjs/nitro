import { createHash } from "node:crypto";
import { promises as fs, existsSync } from "node:fs";
import { basename, normalize } from "pathe";
import type { Plugin } from "rollup";
import MagicString from "magic-string";
import { WasmOptions } from "../../types";

const WASM_ID_PREFIX = "\0nitro-wasm:";

export function wasm(opts: WasmOptions): Plugin {
  type WasmAssetInfo = {
    fileName: string;
    id: string;
    source: Buffer;
    hash: string;
  };

  const wasmSources = new Map<string /* sourceFile */, WasmAssetInfo>();
  const wasmImports = new Map<string /* id */, WasmAssetInfo>();

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
        return;
      }
      const asset = wasmImports.get(id);
      if (!asset) {
        return;
      }
      return {
        code: `export default "${asset.id}";`,
        map: null,
        syntheticNamedExports: true,
      };
    },
    renderChunk(code, chunk, options) {
      if (
        !chunk.moduleIds.some((id) => id.startsWith(WASM_ID_PREFIX)) ||
        !code.includes(WASM_ID_PREFIX)
      ) {
        return;
      }

      const s = new MagicString(code);

      const resolveImport = (id) => {
        if (typeof id !== "string" || !id.startsWith(WASM_ID_PREFIX)) {
          return null;
        }
        const asset = wasmImports.get(id);
        if (!asset) {
          return null;
        }
        const nestedLevel = chunk.fileName.split("/").length - 1;
        const relativeId =
          (nestedLevel ? "../".repeat(nestedLevel) : "./") + asset.fileName;
        return {
          relativeId,
          asset,
        };
      };

      const ReplaceRE = new RegExp(`"(${WASM_ID_PREFIX}[^"]+)"`, "g");
      for (const match of code.matchAll(ReplaceRE)) {
        const resolved = resolveImport(match[1]);
        if (!resolved) {
          console.warn(
            `Failed to resolve WASM import: ${JSON.stringify(match[1])}`
          );
          continue;
        }

        let dataCode: string;
        if (opts.esmImport) {
          dataCode = `await import("${resolved.relativeId}").then(r => r?.default || r)`;
        } else {
          const base64Str = resolved.asset.source.toString("base64");
          dataCode = `(()=>{const d=atob("${base64Str}");const s=d.length;const b=new Uint8Array(s);for(let i=0;i<s;i++)b[i]=d.charCodeAt(i);return b})()`;
        }

        let code = `await WebAssembly.instantiate(${dataCode}).then(r => r?.exports||r?.instance?.exports || r);`;

        if (opts.lazy) {
          code = `(()=>{const e=async()=>{return ${code}};let _p;const p=()=>{if(!_p)_p=e();return _p;};return {then:cb=>p().then(cb),catch:cb=>p().catch(cb)}})()`;
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
