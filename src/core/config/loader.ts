import { loadConfig, watchConfig, type WatchConfigOptions } from "c12";
import { klona } from "klona/full";
import type {
  LoadConfigOptions,
  NitroConfig,
  NitroOptions,
} from "nitropack/types";
import type { PresetName } from "nitropack/presets";
import { NitroDefaults } from "./defaults";

// Resolvers
import { resolvePathOptions } from "./resolvers/paths";
import { resolveImportsOptions } from "./resolvers/imports";
import { resolveRouteRulesOptions } from "./resolvers/route-rules";
import { resolveDatabaseOptions } from "./resolvers/database";
import { resolveFetchOptions } from "./resolvers/fetch";
import { resolveExportConditionsOptions } from "./resolvers/export-conditions";
import { resolveRuntimeConfigOptions } from "./resolvers/runtime-config";
import { resolveOpenAPIOptions } from "./resolvers/open-api";
import { resolveAssetsOptions } from "./resolvers/assets";
import { resolveURLOptions } from "./resolvers/url";
import { resolveCompatibilityDatesFromEnv } from "compatx";

const configResolvers = [
  resolvePathOptions,
  resolveImportsOptions,
  resolveRouteRulesOptions,
  resolveDatabaseOptions,
  resolveFetchOptions,
  resolveExportConditionsOptions,
  resolveRuntimeConfigOptions,
  resolveOpenAPIOptions,
  resolveURLOptions,
  resolveAssetsOptions,
] as const;

export async function loadOptions(
  configOverrides: NitroConfig = {},
  opts: LoadConfigOptions = {}
): Promise<NitroOptions> {
  const options = await _loadUserConfig(configOverrides, opts);
  for (const resolver of configResolvers) {
    await resolver(options);
  }
  return options;
}

async function _loadUserConfig(
  configOverrides: NitroConfig = {},
  opts: LoadConfigOptions = {}
): Promise<NitroOptions> {
  // Preset
  let presetOverride =
    (configOverrides.preset as string) ||
    process.env.NITRO_PRESET ||
    process.env.SERVER_PRESET;
  if (configOverrides.dev) {
    presetOverride = "nitro-dev";
  }

  // Load configuration and preset
  configOverrides = klona(configOverrides);

  // @ts-ignore
  globalThis.defineNitroConfig = globalThis.defineNitroConfig || ((c) => c);

  // Compatibility date
  const compatibilityDates = resolveCompatibilityDatesFromEnv(
    opts.compatibilityDate
  );

  // Preset resolver
  const { resolvePreset } = (await import(
    "nitropack/" + "presets"
  )) as typeof import("nitropack/presets");

  const c12Config = await (opts.watch ? watchConfig : loadConfig)(<
    WatchConfigOptions
  >{
    name: "nitro",
    cwd: configOverrides.rootDir,
    dotenv: configOverrides.dev,
    extend: { extendKey: ["extends", "preset"] },
    overrides: {
      ...configOverrides,
      preset: presetOverride,
    },
    defaultConfig: {
      preset: (
        await resolvePreset("" /* auto detect */, {
          static: configOverrides.static,
          compatibilityDates,
        })
      )?._meta?.name,
    },
    defaults: NitroDefaults,
    jitiOptions: {
      alias: {
        nitropack: "nitropack/config",
        "nitropack/config": "nitropack/config",
      },
    },
    async resolve(id: string) {
      const preset = await resolvePreset(id, {
        static: configOverrides.static,
        compatibilityDates: compatibilityDates,
      });
      if (preset) {
        return {
          config: preset,
        };
      }
    },
    ...opts.c12,
  });

  const options = klona(c12Config.config) as NitroOptions;

  options._config = configOverrides;
  options._c12 = c12Config;

  const _presetName =
    (c12Config.layers || []).find((l) => l.config?._meta?.name)?.config?._meta
      ?.name || presetOverride;

  options.preset = _presetName as PresetName;

  return options;
}
