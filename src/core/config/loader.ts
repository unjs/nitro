import { loadConfig, watchConfig } from "c12";
import { type CompatibilityDateSpec, resolveCompatibilityDates } from "compatx";
import { klona } from "klona/full";
import type { PresetName } from "nitro/presets";
import type {
  LoadConfigOptions,
  NitroConfig,
  NitroOptions,
  NitroPresetMeta,
} from "nitro/types";

import { NitroDefaults } from "./defaults";

import { resolveAssetsOptions } from "./resolvers/assets";
// Resolvers
import {
  fallbackCompatibilityDate,
  resolveCompatibilityOptions,
} from "./resolvers/compatibility";
import { resolveDatabaseOptions } from "./resolvers/database";
import { resolveExportConditionsOptions } from "./resolvers/export-conditions";
import { resolveFetchOptions } from "./resolvers/fetch";
import { resolveImportsOptions } from "./resolvers/imports";
import { resolveOpenAPIOptions } from "./resolvers/open-api";
import { resolvePathOptions } from "./resolvers/paths";
import { resolveRouteRulesOptions } from "./resolvers/route-rules";
import { resolveRuntimeConfigOptions } from "./resolvers/runtime-config";
import { resolveURLOptions } from "./resolvers/url";

const configResolvers = [
  resolveCompatibilityOptions,
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
  let compatibilityDate: CompatibilityDateSpec | undefined =
    configOverrides.compatibilityDate ||
    opts.compatibilityDate ||
    ((process.env.NITRO_COMPATIBILITY_DATE ||
      process.env.SERVER_COMPATIBILITY_DATE ||
      process.env.COMPATIBILITY_DATE) as CompatibilityDateSpec);

  // Preset resolver
  const { resolvePreset } = (await import(
    "nitro/" + "presets"
  )) as typeof import("nitro/presets");

  const loadedConfig = await (opts.watch
    ? watchConfig<NitroConfig & { _meta?: NitroPresetMeta }>
    : loadConfig<NitroConfig & { _meta?: NitroPresetMeta }>)({
    name: "nitro",
    cwd: configOverrides.rootDir,
    dotenv: configOverrides.dev,
    extend: { extendKey: ["extends", "preset"] },
    overrides: {
      ...configOverrides,
      preset: presetOverride,
    },
    async defaultConfig({ configs }) {
      if (!compatibilityDate) {
        compatibilityDate =
          configs.main?.compatibilityDate ||
          configs.rc?.compatibilityDate ||
          configs.packageJson?.compatibilityDate;
      }
      return {
        preset: (
          await resolvePreset("" /* auto detect */, {
            static: configOverrides.static,
            compatibilityDate: compatibilityDate || fallbackCompatibilityDate,
          })
        )?._meta?.name,
      };
    },
    defaults: NitroDefaults,
    jitiOptions: {
      alias: {
        nitropack: "nitro/config",
        "nitro/config": "nitro/config",
      },
    },
    async resolve(id: string) {
      const preset = await resolvePreset(id, {
        static: configOverrides.static,
        compatibilityDate: compatibilityDate || fallbackCompatibilityDate,
      });
      if (preset) {
        return {
          config: preset,
        };
      }
    },
    ...opts.c12,
  });

  const options = klona(loadedConfig.config) as NitroOptions;

  options._config = configOverrides;
  options._c12 = loadedConfig;

  const _presetName =
    (loadedConfig.layers || []).find((l) => l.config?._meta?.name)?.config
      ?._meta?.name || presetOverride;
  options.preset = _presetName as PresetName;

  options.compatibilityDate = resolveCompatibilityDates(
    compatibilityDate,
    options.compatibilityDate
  );

  return options;
}
