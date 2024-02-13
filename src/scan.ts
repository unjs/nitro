import fs from "node:fs";
import { runInNewContext } from "node:vm";
import { relative, join } from "pathe";
import acorn from "acorn";
import { transform } from "esbuild";
import { CallExpression, Node } from "estree";
import { walk } from "estree-walker";
import { globby } from "globby";
import { withBase, withLeadingSlash, withoutTrailingSlash } from "ufo";
import type { Nitro } from "./types";
import type { ServerRouteMeta } from "#internal/nitro/virtual/server-handlers";

export const GLOB_SCAN_PATTERN = "**/*.{js,mjs,cjs,ts,mts,cts,tsx,jsx}";
type FileInfo = { path: string; fullPath: string };

const httpMethodRegex =
  /\.(connect|delete|get|head|options|patch|post|put|trace)$/;

export async function scanHandlers(nitro: Nitro) {
  const middleware = await scanMiddleware(nitro);

  const handlers = await Promise.all([
    scanServerRoutes(nitro, "api", "/api"),
    scanServerRoutes(nitro, "routes", "/"),
  ]).then((r) => r.flat());

  nitro.scannedHandlers = [
    ...middleware,
    ...handlers.filter((h, index, array) => {
      return (
        array.findIndex(
          (h2) => h.route === h2.route && h.method === h2.method
        ) === index
      );
    }),
  ];

  return handlers;
}

export async function scanMiddleware(nitro: Nitro) {
  const files = await scanFiles(nitro, "middleware");
  return files.map((file) => {
    return {
      middleware: true,
      handler: file.fullPath,
    };
  });
}

export async function scanServerRoutes(
  nitro: Nitro,
  dir: "routes" | "api",
  prefix = "/"
) {
  const files = await scanFiles(nitro, dir);
  return await Promise.all(
    files.map(async (file) => {
      let route = file.path
        .replace(/\.[A-Za-z]+$/, "")
        .replace(/\[\.{3}]/g, "**")
        .replace(/\[\.{3}(\w+)]/g, "**:$1")
        .replace(/\[(\w+)]/g, ":$1");
      route = withLeadingSlash(withoutTrailingSlash(withBase(route, prefix)));

      const meta = await scanRouteMeta(file.fullPath);

      let method;
      const methodMatch = route.match(httpMethodRegex);
      if (methodMatch) {
        route = route.slice(0, Math.max(0, methodMatch.index));
        method = methodMatch[1];
      }

      route = route.replace(/\/index$/, "") || "/";

      return {
        handler: file.fullPath,
        lazy: true,
        middleware: false,
        route,
        method,
        meta,
      };
    })
  );
}

export async function scanPlugins(nitro: Nitro) {
  const files = await scanFiles(nitro, "plugins");
  return files.map((f) => f.fullPath);
}

export async function scanTasks(nitro: Nitro) {
  const files = await scanFiles(nitro, "tasks");
  return files.map((f) => {
    const name = f.path
      .replace(/\/index$/, "")
      .replace(/\.[A-Za-z]+$/, "")
      .replace(/\//g, ":");
    return { name, handler: f.fullPath };
  });
}

export async function scanModules(nitro: Nitro) {
  const files = await scanFiles(nitro, "modules");
  return files.map((f) => f.fullPath);
}

async function scanFiles(nitro: Nitro, name: string): Promise<FileInfo[]> {
  const files = await Promise.all(
    nitro.options.scanDirs.map((dir) => scanDir(nitro, dir, name))
  ).then((r) => r.flat());
  return files;
}

async function scanDir(
  nitro: Nitro,
  dir: string,
  name: string
): Promise<FileInfo[]> {
  const fileNames = await globby(join(name, GLOB_SCAN_PATTERN), {
    cwd: dir,
    dot: true,
    ignore: nitro.options.ignore,
    absolute: true,
  });
  return fileNames
    .map((fullPath) => {
      return {
        fullPath,
        path: relative(join(dir, name), fullPath),
      };
    })
    .sort((a, b) => a.path.localeCompare(b.path));
}

export async function scanRouteMeta(
  fullPath: string
): Promise<ServerRouteMeta> {
  const file = fs.readFileSync(fullPath, { encoding: "utf8", flag: "r" });

  let routeMeta: ServerRouteMeta | null = null;

  const js = await transform(file, { loader: "ts" });
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
          routeMeta = JSON.parse(
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

  return routeMeta;
}
