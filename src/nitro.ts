import { existsSync } from "node:fs";
import { resolve } from "pathe";
import { createHooks, createDebugger } from "hookable";
import { createUnimport } from "unimport";
import { defu } from "defu";
import { consola } from "consola";
import type { NitroConfig, Nitro, NitroDynamicConfig } from "./types";
import {
  LoadConfigOptions,
  loadOptions,
  normalizeRouteRules,
  normalizeRuntimeConfig,
} from "./options";
import { scanPlugins } from "./scan";
import { createStorage } from "./storage";

export async function createNitro(
  config: NitroConfig = {},
  opts: LoadConfigOptions = {}
): Promise<Nitro> {
  // Resolve options
  const options = await loadOptions(config, opts);

  // Create context
  const nitro: Nitro = {
    options,
    hooks: createHooks(),
    vfs: {},
    logger: consola.withTag("nitro"),
    scannedHandlers: [],
    close: () => nitro.hooks.callHook("close"),
    storage: undefined,
    async updateConfig(config: NitroDynamicConfig) {
      nitro.options.routeRules = normalizeRouteRules(
        config.routeRules ? config : nitro.options
      );
      nitro.options.runtimeConfig = normalizeRuntimeConfig(
        config.runtimeConfig ? config : nitro.options
      );
      await nitro.hooks.callHook("rollup:reload");
      consola.success("Nitro config hot reloaded!");
    },
  };

  // Storage
  nitro.storage = await createStorage(nitro);
  nitro.hooks.hook("close", async () => {
    await nitro.storage.dispose();
  });

  if (nitro.options.debug) {
    createDebugger(nitro.hooks, { tag: "nitro" });
    nitro.options.plugins.push("#internal/nitro/debug");
  }

  if (nitro.options.timing) {
    nitro.options.plugins.push("#internal/nitro/timing");
  }

  // Logger config
  if (nitro.options.logLevel !== undefined) {
    nitro.logger.level = nitro.options.logLevel;
  }

  // Init hooks
  nitro.hooks.addHooks(nitro.options.hooks);

  // Public assets
  for (const dir of options.scanDirs) {
    const publicDir = resolve(dir, "public");
    if (!existsSync(publicDir)) {
      continue;
    }
    if (options.publicAssets.some((asset) => asset.dir === publicDir)) {
      continue;
    }
    options.publicAssets.push({ dir: publicDir } as any);
  }
  for (const asset of options.publicAssets) {
    asset.baseURL = asset.baseURL || "/";
    const isTopLevel = asset.baseURL === "/";
    asset.fallthrough = asset.fallthrough ?? isTopLevel;
    const routeRule = options.routeRules[asset.baseURL + "/**"];
    asset.maxAge =
      (routeRule?.cache as { maxAge: number })?.maxAge ?? asset.maxAge ?? 0;
    if (asset.maxAge && !asset.fallthrough) {
      options.routeRules[asset.baseURL + "/**"] = defu(routeRule, {
        headers: {
          "cache-control": `public, max-age=${asset.maxAge}, immutable`,
        },
      });
    }
  }

  // Server assets
  nitro.options.serverAssets.push({
    baseName: "server",
    dir: resolve(nitro.options.srcDir, "assets"),
  });

  // Plugins
  const scannedPlugins = await scanPlugins(nitro);
  for (const plugin of scannedPlugins) {
    if (!nitro.options.plugins.includes(plugin)) {
      nitro.options.plugins.push(plugin);
    }
  }

  // Auto imports
  if (nitro.options.imports) {
    nitro.unimport = createUnimport(nitro.options.imports);
    // Support for importing from '#imports'
    nitro.options.virtual["#imports"] = () => nitro.unimport.toExports();
    // Backward compatibility
    nitro.options.virtual["#nitro"] = 'export * from "#imports"';
  }

  return nitro;
}
