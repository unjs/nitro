import { pathToFileURL } from "node:url";
import { resolve, join, isAbsolute } from "pathe";
import { loadConfig } from "c12";
import { klona } from "klona/full";
import { camelCase } from "scule";
import { defu } from "defu";
import { resolveModuleExportNames, resolvePath as resolveModule } from "mlly";
// import escapeRE from 'escape-string-regexp'
import { withLeadingSlash, withoutTrailingSlash, withTrailingSlash } from "ufo";
import { isTest, isDebug } from "std-env";
import { findWorkspaceDir } from "pkg-types";
import { resolvePath, detectTarget } from "./utils";
import type { NitroConfig, NitroOptions, NitroRouteConfig, NitroRouteRules } from "./types";
import { runtimeDir, pkgDir } from "./dirs";
import * as _PRESETS from "./presets";
import { nitroImports } from "./imports";

const NitroDefaults: NitroConfig = {
  // General
  debug: isDebug,
  logLevel: isTest ? 1 : 3,
  runtimeConfig: { app: {}, nitro: {} },

  // Dirs
  scanDirs: [],
  buildDir: ".nitro",
  output: {
    dir: "{{ rootDir }}/.output",
    serverDir: "{{ output.dir }}/server",
    publicDir: "{{ output.dir }}/public"
  },

  // Featueres
  experimental: {},
  storage: {},
  devStorage: {},
  bundledStorage: [],
  publicAssets: [],
  serverAssets: [],
  plugins: [],
  imports: {
    exclude: [/[/\\]node_modules[/\\]/, /[/\\]\.git[/\\]/],
    presets: nitroImports
  },
  virtual: {},
  compressPublicAssets: false,

  // Dev
  dev: false,
  devServer: { watch: [] },
  watchOptions: { ignoreInitial: true },
  devProxy: {},

  // Routing
  baseURL: process.env.NITRO_APP_BASE_URL || "/",
  handlers: [],
  devHandlers: [],
  errorHandler: "#internal/nitro/error",
  routeRules: {},
  prerender: {
    crawlLinks: false,
    ignore: [],
    routes: []
  },

  // Rollup
  alias: {
    "#internal/nitro": runtimeDir
  },
  unenv: {},
  analyze: false,
  moduleSideEffects: [
    "unenv/runtime/polyfill/",
    "node-fetch-native/polyfill",
    "node-fetch-native/dist/polyfill"
  ],
  replace: {},
  node: true,
  sourceMap: true,

  // Advanced
  typescript: {
    generateTsConfig: true,
    internalPaths: false
  },
  nodeModulesDirs: [],
  hooks: {},
  commands: {}
};

export async function loadOptions (configOverrides: NitroConfig = {}): Promise<NitroOptions> {
  // Preset
  let presetOverride = configOverrides.preset || process.env.NITRO_PRESET;
  const defaultPreset = detectTarget() || "node-server";
  if (configOverrides.dev) {
    presetOverride = "nitro-dev";
  }

  // Load configuration and preset
  configOverrides = klona(configOverrides);
  const { config, layers } = await loadConfig({
    name: "nitro",
    cwd: configOverrides.rootDir,
    dotenv: configOverrides.dev,
    extend: { extendKey: ["extends", "preset"] },
    overrides: {
      ...configOverrides,
      preset: presetOverride
    },
    defaultConfig: {
      preset: defaultPreset
    },
    defaults: NitroDefaults,
    resolve (id: string) {
      const presets = _PRESETS as any as Map<String, NitroConfig>;
      let matchedPreset = presets[camelCase(id)] || presets[id];
      if (!matchedPreset) {
        return null;
      }
      if (typeof matchedPreset === "function") {
        matchedPreset = matchedPreset();
      }
      return {
        config: matchedPreset
      };
    }
  });
  const options = klona(config) as NitroOptions;
  options._config = configOverrides;

  options.preset = presetOverride || layers.find(l => l.config.preset)?.config.preset || defaultPreset;

  options.rootDir = resolve(options.rootDir || ".");
  options.workspaceDir = await findWorkspaceDir(options.rootDir).catch(() => options.rootDir);
  options.srcDir = resolve(options.srcDir || options.rootDir);
  for (const key of ["srcDir", "publicDir", "buildDir"]) {
    options[key] = resolve(options.rootDir, options[key]);
  }

  // Add aliases
  options.alias = {
    ...options.alias,
    "~/": join(options.srcDir, "/"),
    "@/": join(options.srcDir, "/"),
    "~~/": join(options.rootDir, "/"),
    "@@/": join(options.rootDir, "/")
  };

  // Resolve possibly template paths
  if (!options.entry) {
    throw new Error(`Nitro entry is missing! Is "${options.preset}" preset correct?`);
  }
  options.entry = resolvePath(options.entry, options);
  options.output.dir = resolvePath(options.output.dir || NitroDefaults.output.dir, options);
  options.output.publicDir = resolvePath(options.output.publicDir || NitroDefaults.output.publicDir, options);
  options.output.serverDir = resolvePath(options.output.serverDir || NitroDefaults.output.serverDir, options);

  options.nodeModulesDirs.push(resolve(options.workspaceDir, "node_modules"));
  options.nodeModulesDirs.push(resolve(options.rootDir, "node_modules"));
  options.nodeModulesDirs.push(resolve(pkgDir, "node_modules"));
  options.nodeModulesDirs = [...new Set(options.nodeModulesDirs.map(dir => resolve(options.rootDir, dir)))];

  if (options.scanDirs.length === 0) {
    options.scanDirs = [options.srcDir];
  }

  if (options.imports && Array.isArray(options.imports.exclude)) {
    options.imports.exclude.push(options.buildDir);
  }

  // Normalise absolute auto-import paths for windows machines
  if (options.imports && options.dev) {
    options.imports.imports = options.imports.imports || [];
    for (const entry of options.imports.imports) {
      if (isAbsolute(entry.from)) {
        entry.from = pathToFileURL(entry.from).href;
      }
    }
  }

  // Add h3 auto imports preset
  if (options.imports) {
    const h3Exports = await resolveModuleExportNames("h3", { url: import.meta.url });
    options.imports.presets.push({
      from: "h3",
      imports: h3Exports.filter(n => !/^[A-Z]/.test(n) && n !== "use")
    });
  }

  // Backward compatibility for options.routes
  options.routeRules = defu(options.routeRules, (options as any).routes || {});

  // Normalize route rules (NitroRouteConfig => NitroRouteRules)
  const normalizedRules: { [p: string]: NitroRouteRules } = {};
  for (const path in options.routeRules) {
    const routeConfig = options.routeRules[path] as NitroRouteConfig;
    const routeRules: NitroRouteRules = {
      ...routeConfig,
      redirect: undefined
    };
    // Redirect
    if (routeConfig.redirect) {
      routeRules.redirect = {
        to: "/",
        statusCode: 307,
        ...(typeof routeConfig.redirect === "string" ? { to: routeConfig.redirect } : routeConfig.redirect)
      };
    }
    // CORS
    if (routeConfig.cors) {
      routeRules.headers = {
        "access-control-allow-origin": "*",
        "access-control-allowed-methods": "*",
        "access-control-allow-headers": "*",
        "access-control-max-age": "0",
        ...routeRules.headers
      };
    }
    // Cache: swr
    if (routeConfig.swr) {
      routeRules.cache = routeRules.cache || {};
      routeRules.cache.swr = true;
      if (typeof routeConfig.swr === "number") {
        routeRules.cache.maxAge = routeConfig.swr;
      }
    }
    // Cache: static
    if (routeConfig.static) {
      routeRules.cache = routeRules.cache || {};
      routeRules.cache.static = true;
    }
    // Cache: false
    if (routeConfig.cache === false) {
      routeRules.cache = false;
    }
    normalizedRules[path] = routeRules;
  }
  options.routeRules = normalizedRules;

  options.baseURL = withLeadingSlash(withTrailingSlash(options.baseURL));
  options.runtimeConfig = defu(options.runtimeConfig, {
    app: {
      baseURL: options.baseURL
    },
    nitro: {
      routeRules: options.routeRules
    }
  });

  for (const asset of options.publicAssets) {
    asset.dir = resolve(options.srcDir, asset.dir);
    asset.baseURL = withLeadingSlash(withoutTrailingSlash(asset.baseURL || "/"));
  }

  for (const pkg of ["defu", "h3", "radix3"]) {
    if (!options.alias[pkg]) {
      options.alias[pkg] = await resolveModule(pkg, { url: import.meta.url });
    }
  }

  // Build-only storage
  const fsMounts = {
    root: resolve(options.rootDir),
    src: resolve(options.srcDir),
    build: resolve(options.buildDir),
    cache: resolve(options.buildDir, "cache")
  };
  for (const p in fsMounts) {
    options.devStorage[p] = options.devStorage[p] || { driver: "fs", base: fsMounts[p] };
  }

  // Resolve plugin paths
  options.plugins = options.plugins.map((p) => {
    const path = resolvePath(p, options);
    if (options.dev && isAbsolute(path)) {
      return pathToFileURL(path).href;
    }
    return path;
  });

  return options;
}

export function defineNitroConfig (config: NitroConfig): NitroConfig {
  return config;
}
