import destr from "destr";
import { snakeCase } from "scule";
import { klona } from "klona";
import { H3Event } from "h3";
import { appConfig as _inlineAppConfig } from "#internal/nitro/virtual/app-config";
import type { NitroRuntimeConfig } from "nitropack";

// Static runtime config inlined by nitro build
const _inlineRuntimeConfig = process.env.RUNTIME_CONFIG as any;
const ENV_PREFIX = "NITRO_";
const ENV_PREFIX_ALT =
  _inlineRuntimeConfig.nitro.envPrefix ?? process.env.NITRO_ENV_PREFIX ?? "_";

// Runtime config
const _sharedRuntimeConfig = _deepFreeze(
  _applyEnv(klona(_inlineRuntimeConfig))
);
export function useRuntimeConfig<
  T extends NitroRuntimeConfig = NitroRuntimeConfig
>(event?: H3Event): T {
  // Backwards compatibility with ambient context
  if (!event) {
    return _sharedRuntimeConfig as T;
  }
  // Reuse cached runtime config from event context
  if (event.context.nitro.runtimeConfig) {
    return event.context.nitro.runtimeConfig;
  }
  // Prepare runtime config for event context
  const runtimeConfig = klona(_inlineRuntimeConfig) as T;
  _applyEnv(runtimeConfig);
  event.context.nitro.runtimeConfig = runtimeConfig;
  return runtimeConfig;
}

// App config
const _sharedAppConfig = _deepFreeze(klona(_inlineAppConfig));
export function useAppConfig(event?: H3Event) {
  // Backwards compatibility with ambient context
  if (!event) {
    return _sharedAppConfig;
  }
  // Reuse cached app config from event context
  if (event.context.nitro.appConfig) {
    return event.context.nitro.appConfig;
  }
  // Prepare app config for event context
  const appConfig = klona(_inlineAppConfig);
  event.context.nitro.appConfig = appConfig;
  return appConfig;
}

// --- Utils ---

function _getEnv(key: string) {
  const envKey = snakeCase(key).toUpperCase();
  return destr(
    process.env[ENV_PREFIX + envKey] ?? process.env[ENV_PREFIX_ALT + envKey]
  );
}

function _isObject(input: unknown) {
  return typeof input === "object" && !Array.isArray(input);
}

function _applyEnv(obj: object, parentKey = "") {
  for (const key in obj) {
    const subKey = parentKey ? `${parentKey}_${key}` : key;
    const envValue = _getEnv(subKey);
    if (_isObject(obj[key])) {
      if (_isObject(envValue)) {
        obj[key] = { ...obj[key], ...(envValue as any) };
      }
      _applyEnv(obj[key], subKey);
    } else {
      obj[key] = envValue ?? obj[key];
    }
  }
  return obj;
}

function _deepFreeze(object: Record<string, any>) {
  const propNames = Object.getOwnPropertyNames(object);
  for (const name of propNames) {
    const value = object[name];
    if (value && typeof value === "object") {
      _deepFreeze(value);
    }
  }
  return Object.freeze(object);
}

// --- Deprecated default export ---
// TODO: Remove in next major version
export default new Proxy(Object.create(null), {
  get: (_, prop) => {
    console.warn(
      "Please use `useRuntimeConfig()` instead of accessing config directly."
    );
    const runtimeConfig = useRuntimeConfig();
    if (prop in runtimeConfig) {
      return runtimeConfig[prop as string];
    }
    return undefined;
  },
});
