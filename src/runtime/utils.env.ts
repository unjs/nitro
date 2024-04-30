import destr from "destr";
import { snakeCase } from "scule";

export type EnvOptions = {
  env?: Record<string, unknown>;
  prefix?: string;
  altPrefix?: string;
  envExpansion?: boolean;
};

export function getEnv(key: string, opts: EnvOptions) {
  const env = opts.env ?? process.env
  const envKey = snakeCase(key).toUpperCase();
  return destr(
    env[opts.prefix + envKey] ?? env[opts.altPrefix + envKey]
  );
}

function _isObject(input: unknown) {
  return typeof input === "object" && !Array.isArray(input);
}

export function applyEnv(
  obj: Record<string, any>,
  opts: EnvOptions,
  parentKey = ""
) {
  for (const key in obj) {
    const subKey = parentKey ? `${parentKey}_${key}` : key;
    const envValue = getEnv(subKey, opts);
    if (_isObject(obj[key])) {
      // Same as before
      if (_isObject(envValue)) {
        obj[key] = { ...(obj[key] as any), ...(envValue as any) };
        applyEnv(obj[key], opts, subKey);
      }
      // If envValue is undefined
      // Then proceed to nested properties
      else if (envValue === undefined) {
        applyEnv(obj[key], opts, subKey);
      }
      // If envValue is a primitive other than undefined
      // Then set objValue and ignore the nested properties
      else {
        obj[key] = envValue ?? obj[key];
      }
    } else {
      obj[key] = envValue ?? obj[key];
    }
    // Experimental env expansion
    if (opts.envExpansion && typeof obj[key] === "string") {
      obj[key] = _expandFromEnv(obj[key], opts.env);
    }
  }
  return obj;
}

const envExpandRx = /{{(.*?)}}/g;

function _expandFromEnv(value: string, env: Record<string, any> = process.env) {
  return value.replace(envExpandRx, (match, key) => {
    return env[key] || match;
  });
}
