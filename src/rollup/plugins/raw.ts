import { promises as fsp } from "node:fs";
import mime from "mime";
import type { RawOptions } from "nitro/types";
import { extname } from "pathe";
import type { Plugin } from "rollup";

const HELPER_ID = "\0raw-helpers";

export function raw(opts: RawOptions = {}): Plugin {
  const extensions = new Set([
    ".md",
    ".mdx",
    ".txt",
    ".css",
    ".htm",
    ".html",
    ...(opts.extensions || []),
  ]);

  return {
    name: "raw",
    async resolveId(id, importer) {
      if (id === HELPER_ID) {
        return id;
      }

      if (id[0] === "\0") {
        return;
      }

      let isRawId = id.startsWith("raw:");
      if (isRawId) {
        id = id.slice(4);
      } else if (extensions.has(extname(id))) {
        isRawId = true;
      }

      if (!isRawId) {
        return;
      }

      const resolvedId = (await this.resolve(id, importer, { skipSelf: true }))
        ?.id;

      if (!resolvedId || resolvedId.startsWith("\0")) {
        return resolvedId;
      }

      return { id: "\0raw:" + resolvedId };
    },
    load(id) {
      if (id === HELPER_ID) {
        return getHelpers();
      }
      if (id.startsWith("\0raw:")) {
        // this.addWatchFile(id.substring(5))
        return fsp.readFile(id.slice(5), isBinary(id) ? "binary" : "utf8");
      }
    },
    transform(code, id) {
      if (!id.startsWith("\0raw:")) {
        return;
      }
      if (isBinary(id)) {
        const serialized = Buffer.from(code, "binary").toString("base64");
        return {
          code: `// ROLLUP_NO_REPLACE \n import {base64ToUint8Array } from "${HELPER_ID}" \n export default base64ToUint8Array("${serialized}")`,
          map: null,
        };
      }
      return {
        code: `// ROLLUP_NO_REPLACE \n export default ${JSON.stringify(code)}`,
        map: null,
      };
    },
  };
}

function isBinary(id: string) {
  const idMime = mime.getType(id) || "";
  if (idMime.startsWith("text/")) {
    return false;
  }
  if (/application\/(json|xml|yaml)/.test(idMime)) {
    return false;
  }
  return true;
}

function getHelpers() {
  const js = String.raw;
  return js`
export function base64ToUint8Array(str) {
  const data = atob(str);
  const size = data.length;
  const bytes = new Uint8Array(size);
  for (let i = 0; i < size; i++) {
    bytes[i] = data.charCodeAt(i);
  }
  return bytes;
}
  `;
}
