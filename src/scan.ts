import { relative, join } from "pathe";
import { globby } from "globby";
import { withBase, withLeadingSlash, withoutTrailingSlash } from "ufo";
import type { Nitro } from "./types";

export const GLOB_SCAN_PATTERN = "**/*.{js,mjs,cjs,ts,mts,cts,tsx,jsx}";
type FileInfo = { path: string; fullPath: string };

const httpMethodRegex =
  /\.(connect|delete|get|head|options|patch|post|put|trace)/;

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
      middlweware: false,
      route,
      method,
    };
  });
}

export async function scanPlugins(nitro: Nitro) {
  const files = await scanFiles(nitro, "plugins");
  return files;
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
