import destr from "destr";
import { snakeCase } from "scule";
import { appConfig as _appConfig } from "#internal/nitro/virtual/app-config";

// Runtime config
const _runtimeConfig = process.env.RUNTIME_CONFIG as any;
const ENV_PREFIX = "NITRO_";
const ENV_PREFIX_ALT =
  _runtimeConfig.nitro.envPrefix ?? process.env.NITRO_ENV_PREFIX ?? "_";
overrideConfig(_runtimeConfig);

const runtimeConfig = deepFreeze(_runtimeConfig);
export default runtimeConfig; // TODO: Remove in next major version
export const useRuntimeConfig = () => runtimeConfig;

// App config
const appConfig = deepFreeze(_appConfig);
export const useAppConfig = () => appConfig;

// --- Utils ---

function getEnv(key: string) {
  const envKey = snakeCase(key).toUpperCase();
  return destr(
    process.env[ENV_PREFIX + envKey] ?? process.env[ENV_PREFIX_ALT + envKey]
  );
}

function isObject(input: unknown) {
  return typeof input === "object" && !Array.isArray(input);
}

function overrideConfig(obj: object, parentKey = "") {
  for (const key in obj) {
    const subKey = parentKey ? `${parentKey}_${key}` : key;
    const envValue = getEnv(subKey);
    if (isObject(obj[key])) {
      if (isObject(envValue)) {
        obj[key] = { ...obj[key], ...envValue };
      }
      overrideConfig(obj[key], subKey);
    } else {
      obj[key] = envValue ?? obj[key];
    }
  }
}

function deepFreeze(object: Record<string, any>) {
  const propNames = Object.getOwnPropertyNames(object);
  for (const name of propNames) {
    const value = object[name];
    if (value && typeof value === "object") {
      deepFreeze(value);
    }
  }
  return Object.freeze(object);
}
