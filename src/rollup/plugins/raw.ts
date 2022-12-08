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
        return fsp.readFile(id.slice(5), "utf8");
      }
    },
    transform(code, id) {
      if (id.startsWith("\0raw:")) {
        return {
          code: `// ROLLUP_NO_REPLACE \n export default ${JSON.stringify(
            code
          )}`,
          map: null,
        };
      }
    },
  };
}
