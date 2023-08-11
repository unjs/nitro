import { createHash } from "node:crypto";
import { extname, basename } from "node:path";
import { promises as fs } from "node:fs";
import type { Plugin } from "rollup";

const PLUGIN_NAME = "nitro:wasm-import";
const wasmRegex = /\.wasm$/;

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
        console.log({ filepath });
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

        const outputFileName = "wasm/[name]-[hash][extname]"
          .replace(/\[hash]/g, hash)
          .replace(/\[extname]/g, ext)
          .replace(/\[name]/g, name);

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
            name: "Rollup WASM Asset",
            fileName: copy.filename,
          });
        })
      );
    },
  };
}
