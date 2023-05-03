import type { Plugin } from "rollup";
import { Nitro } from "../../types";

export function importMeta(nitro: Nitro): Plugin {
  const ImportMetaRe = /import\.meta|globalThis._importMeta_/;

  return {
    name: "import-meta",
    renderChunk(code, chunk) {
      const isEntry = chunk.isEntry;
      if (
        !isEntry &&
        (!ImportMetaRe.test(code) || code.includes("ROLLUP_NO_REPLACE"))
      ) {
        return;
      }
      const url =
        (nitro.options.preset === "bun" || nitro.options.node) && isEntry
          ? "_import_meta_url_"
          : '"file:///_entry.js"';
      const env = nitro.options.node ? "process.env" : "{}";
      const ref = "globalThis._importMeta_";
      const stub = `{url:${url},env:${env}}`;
      const stubInit = isEntry ? `${ref}=${stub};` : `${ref}=${ref}||${stub};`;

      return {
        code: stubInit + code,
        map: null,
      };
    },
  };
}
