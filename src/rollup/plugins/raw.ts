import { promises as fsp } from "node:fs";
import { extname } from "pathe";
import type { Plugin } from "rollup";

export interface RawOptions {
  extensions?: string[];
}

export function raw(opts: RawOptions = {}): Plugin {
  const extensions = new Set([
    ".md",
    ".mdx",
    ".yml",
    ".txt",
    ".css",
    ".htm",
    ".html",
    ...(opts.extensions || []),
  ]);

  // TODO: use ext=>mime
  const isBinary = (id) => !extensions.has(extname(id));

  return {
    name: "raw",
    resolveId(id) {
      if (id[0] === "\0") {
        return;
      }

      let isRawId = id.startsWith("raw:");
      if (isRawId) {
        id = id.slice(4);
      } else if (extensions.has(extname(id))) {
        isRawId = true;
      }

      // TODO: Support reasolving. Blocker is CommonJS custom resolver!
      if (isRawId) {
        return { id: "\0raw:" + id };
      }
    },
    load(id) {
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
          code: `// ROLLUP_NO_REPLACE \n ${getHelpers()}\n export default base64ToUint8Array("${serialized}")`,
          map: null,
        };
      } else {
        return {
          code: `// ROLLUP_NO_REPLACE \n export default ${JSON.stringify(code)}`,
          map: null,
        };
      }
    },
  };
}

function getHelpers() {
  const js = String.raw;
  return js`
function base64ToUint8Array(str) {
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
