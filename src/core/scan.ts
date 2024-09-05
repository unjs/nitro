import { globby } from "globby";
import type { Nitro } from "nitro/types";
import { join, relative } from "pathe";
import { withBase, withLeadingSlash, withoutTrailingSlash } from "ufo";

export const GLOB_SCAN_PATTERN = "**/*.{js,mjs,cjs,ts,mts,cts,tsx,jsx}";
type FileInfo = { path: string; fullPath: string };

const suffixRegex =
  /\.(connect|delete|get|head|options|patch|post|put|trace)(\.(dev|prod|prerender))?$/;

// prettier-ignore
// biome-ignore format: keep inline for better readability
type MatchedMethodSuffix = "connect" | "delete" | "get" | "head" | "options" | "patch" | "post" | "put" | "trace";
type MatchedEnvSuffix = "dev" | "prod" | "prerender";

export async function scanAndSyncOptions(nitro: Nitro) {
  // Scan plugins
  const scannedPlugins = await scanPlugins(nitro);
  for (const plugin of scannedPlugins) {
    if (!nitro.options.plugins.includes(plugin)) {
      nitro.options.plugins.push(plugin);
    }
  }

  // Scan tasks
  if (nitro.options.experimental.tasks) {
    const scannedTasks = await scanTasks(nitro);
    for (const scannedTask of scannedTasks) {
      if (scannedTask.name in nitro.options.tasks) {
        if (!nitro.options.tasks[scannedTask.name].handler) {
          nitro.options.tasks[scannedTask.name].handler = scannedTask.handler;
        }
      } else {
        nitro.options.tasks[scannedTask.name] = {
          handler: scannedTask.handler,
          description: "",
        };
      }
    }
  }

  // Scan modules
  const scannedModules = await scanModules(nitro);
  nitro.options.modules = nitro.options.modules || [];
  for (const modPath of scannedModules) {
    if (!nitro.options.modules.includes(modPath)) {
      nitro.options.modules.push(modPath);
    }
  }
}

export async function scanHandlers(nitro: Nitro) {
  const middleware = await scanMiddleware(nitro);

  const handlers = await Promise.all([
    scanServerRoutes(
      nitro,
      nitro.options.apiDir || "api",
      nitro.options.apiBaseURL || "/api"
    ),
    scanServerRoutes(nitro, nitro.options.routesDir || "routes"),
  ]).then((r) => r.flat());

  nitro.scannedHandlers = [
    ...middleware,
    ...handlers.filter((h, index, array) => {
      return (
        array.findIndex(
          (h2) =>
            h.route === h2.route && h.method === h2.method && h.env === h2.env
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
  dir: string,
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

    const suffixMatch = route.match(suffixRegex);
    let method: MatchedMethodSuffix | undefined;
    let env: MatchedEnvSuffix | undefined;
    if (suffixMatch?.index) {
      route = route.slice(0, Math.max(0, suffixMatch.index));
      method = suffixMatch[1] as MatchedMethodSuffix;
      env = suffixMatch[3] as MatchedEnvSuffix;
    }

    route = route.replace(/\/index$/, "") || "/";

    return {
      handler: file.fullPath,
      lazy: true,
      middleware: false,
      route,
      method,
      env,
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
