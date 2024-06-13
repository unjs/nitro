import defu from "defu";
import type {
  NitroOptions,
  NitroConfig,
  NitroRuntimeConfig,
} from "nitro/types";

export async function resolveRuntimeConfigOptions(options: NitroOptions) {
  options.runtimeConfig = normalizeRuntimeConfig(options);
}

export function normalizeRuntimeConfig(config: NitroConfig) {
  provideFallbackValues(config.runtimeConfig || {});
  const runtimeConfig: NitroRuntimeConfig = defu(
    config.runtimeConfig as NitroRuntimeConfig,
    <NitroRuntimeConfig>{
      app: {
        baseURL: config.baseURL,
      },
      nitro: {
        envExpansion: config.experimental?.envExpansion,
        openAPI: config.openAPI,
      },
    }
  );
  runtimeConfig.nitro.routeRules = config.routeRules;
  return runtimeConfig as NitroRuntimeConfig;
}

function provideFallbackValues(obj: Record<string, any>) {
  for (const key in obj) {
    if (obj[key] === undefined || obj[key] === null) {
      obj[key] = "";
    } else if (typeof obj[key] === "object") {
      provideFallbackValues(obj[key]);
    }
  }
}
