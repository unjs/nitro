import defu from "defu";
import type {
  NitroConfig,
  NitroOptions,
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
  checkSerializableRuntimeConfig(runtimeConfig);
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

function checkSerializableRuntimeConfig(obj: any, path: string[] = []) {
  for (const key in obj) {
    const value = obj[key];
    if (
      value === null ||
      typeof value === "string" ||
      value === undefined ||
      typeof value === "number" ||
      typeof value === "boolean"
    ) {
      continue;
    }

    if (Array.isArray(value)) {
      for (const [index, item] of value.entries())
        checkSerializableRuntimeConfig(item, [...path, `${key}[${index}]`]);
    } else if (
      typeof value === "object" &&
      value.constructor === Object &&
      (!value.constructor?.name || value.constructor.name === "Object")
    ) {
      checkSerializableRuntimeConfig(value, [...path, key]);
    } else {
      console.warn(
        `Runtime config option \`${[...path, key].join(".")}\` may not be able to be serialized.`
      );
    }
  }
}
