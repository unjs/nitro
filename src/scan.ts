import fs from "node:fs";
import { relative, join } from "pathe";
import { globby } from "globby";
import { withBase, withLeadingSlash, withoutTrailingSlash } from "ufo";
import type { Nitro } from "./types";
import type { ServerRouteMeta } from "#internal/nitro/virtual/server-handlers";

export const GLOB_SCAN_PATTERN = "**/*.{js,mjs,cjs,ts,mts,cts,tsx,jsx}";
type FileInfo = { path: string; fullPath: string};

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
  return files.map((file) => {
    let route = file.path
      .replace(/\.[A-Za-z]+$/, "")
      .replace(/\[\.{3}]/g, "**")
      .replace(/\[\.{3}(\w+)]/g, "**:$1")
      .replace(/\[(\w+)]/g, ":$1");
    route = withLeadingSlash(withoutTrailingSlash(withBase(route, prefix)));

    const meta = scanRouteForMeta(file.fullPath)

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
      meta
    };
  });
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

export function scanRouteForMeta(
  fullPath: string,
) {
  const file = fs.readFileSync(fullPath, { encoding: 'utf8', flag: 'r' });
  const defineRouteMetaRegex = /^(?!\/\/)(\S?)defineRouteMeta+\([^)]*\)(\.[^)]*\))?/gm;
  const routeMeta = defineRouteMetaRegex.exec(file);
  if (routeMeta) {
    const objectDetectRegex = /{[^)]*}(\.[^)]*})?/;
    const metaStringObject = objectDetectRegex.exec(routeMeta[0]);
    const metaObject = 
      JSON.stringify(metaStringObject[0])
        .replace(/(?:\\[nr])+\s{4,}/g, '')
        .replace(/(?:\\[nr])+/g, '')
        .replace(/'/g, '"')
        .replace(/\\"/g, '"')
        .replace(/[^,{]\w+:(\s?)/g, (match) => {
          const str = match.replace(/: /g, "")
          const adjustedStr = "\"" + str + "\":"
          return adjustedStr
        })
        .replace(/,}/g, "}")
        .replace(/,]/g, "]");

    const parsedMeta = JSON.parse(objectDetectRegex.exec(metaObject)[0]);

    const meta: ServerRouteMeta = Object.assign({}, parsedMeta);
   
    return meta;
  }
}