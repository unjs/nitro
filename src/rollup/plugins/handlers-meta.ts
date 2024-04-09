import { runInNewContext } from "node:vm";
import { readFile } from "node:fs/promises";
import acorn from "acorn";
import { transform } from "esbuild";
import { CallExpression, Node } from "estree";
import { walk } from "estree-walker";
import type { Plugin } from "rollup";
import { Nitro, NitroEventHandlerMeta } from "../../types";

const virtualPrefix = "\0nitro-handler-meta:";

export function handlersMeta(nitro: Nitro) {
  return {
    name: "nitro:handlers-meta",
    async resolveId(id) {
      if (id.startsWith("\0")) {
        return;
      }
      if (id.endsWith(`?meta`)) {
        const resolved = await this.resolve(id.replace(`?meta`, ``));
        return virtualPrefix + resolved.id;
      }
    },
    load(id) {
      if (id.startsWith(virtualPrefix)) {
        const fullPath = id.slice(virtualPrefix.length);
        return readFile(fullPath, { encoding: "utf8" });
      }
    },
    async transform(code, id) {
      if (!id.startsWith(virtualPrefix)) {
        return;
      }
      let meta: NitroEventHandlerMeta | null = null;

      const js = await transform(code, { loader: "ts" });
      const fileAST = acorn.parse(js.code, {
        ecmaVersion: "latest",
        sourceType: "module",
      }) as Node;

      walk(fileAST, {
        enter(_node) {
          if (
            _node.type !== "CallExpression" ||
            (_node as CallExpression).callee.type !== "Identifier"
          ) {
            return;
          }
          const node = _node as CallExpression & { start: number; end: number };
          const name = "name" in node.callee && node.callee.name;

          if (name === "defineRouteMeta") {
            const metaString = js.code.slice(node.start, node.end);
            try {
              meta = JSON.parse(
                runInNewContext(
                  metaString.replace("defineRouteMeta", "JSON.stringify"),
                  {}
                )
              );
            } catch {
              throw new Error(
                "[nitro] Error parsing route meta. They should be JSON-serializable"
              );
            }
          }
        },
      });

      return {
        code: `export default ${JSON.stringify(meta)};`,
        map: null,
      };
    },
  } satisfies Plugin;
}
