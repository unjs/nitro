import { createHash } from "node:crypto";
import { extname, basename } from "node:path";
import { promises as fs } from "node:fs";
import type { Plugin } from "rollup";
import wasmBundle from "@rollup/plugin-wasm";
import { WasmOptions } from "../../types";

const PLUGIN_NAME = "nitro:wasm-import";
const wasmRegex = /\.wasm$/;

export function wasm(options: WasmOptions): Plugin {
  return options.esmImport ? wasmImport() : wasmBundle(options.bundle);
}

export function wasmImport(): Plugin {
  const copies = Object.create(null);

  return {
    name: PLUGIN_NAME,
    async resolveId(id: string, importer: string) {
      if (copies[id]) {
        return {
          id: copies[id].publicFilepath,
          external: true,
        };
      }
      if (wasmRegex.test(id)) {
        const { id: filepath } =
          (await this.resolve(id, importer, { skipSelf: true })) || {};
        if (!filepath || filepath === id) {
          return null;
        }
        const buffer = await fs.readFile(filepath);
        const hash = createHash("sha1")
          .update(buffer)
          .digest("hex")
          .slice(0, 16);
        const ext = extname(filepath);
        const name = basename(filepath, ext);

        const outputFileName = `wasm/${name}-${hash}${ext}`;
        const publicFilepath = `./${outputFileName}`;

        copies[id] = {
          filename: outputFileName,
          publicFilepath,
          buffer,
        };

        return {
          id: publicFilepath,
          external: true,
        };
      }
    },
    async generateBundle() {
      await Promise.all(
        Object.keys(copies).map(async (name) => {
          const copy = copies[name];
          await this.emitFile({
            type: "asset",
            source: copy.buffer,
            fileName: copy.filename,
          });
        })
      );
    },
  };
}
