import destr from 'destr'
import { snakeCase } from 'scule'

// Bundled runtime config (injected by nitro)
const _runtimeConfig = process.env.RUNTIME_CONFIG as any

const ENV_PREFIX = 'NITRO_'
const ENV_PREFIX_ALT = _runtimeConfig.nitro.envPrefix ?? process.env.NITRO_ENV_PREFIX ?? '_'

// Allow override from process.env and deserialize
const getEnv = (key: string) => {
  const envKey = snakeCase(key).toUpperCase()
  return destr(process.env[ENV_PREFIX + envKey] ?? process.env[ENV_PREFIX_ALT + envKey])
}

for (const key in _runtimeConfig) {
  _runtimeConfig[key] = getEnv(key) ?? _runtimeConfig[key]
  if (_runtimeConfig[key] && typeof _runtimeConfig[key] === 'object') {
    for (const subkey in _runtimeConfig[key]) {
      // key: { subKey } can be overridden by KEY_SUB_KEY`
      _runtimeConfig[key][subkey] = getEnv(`${key}_${subkey}`) ?? _runtimeConfig[key][subkey]
    }
  }
}

// Named exports
const config = deepFreeze(_runtimeConfig)
export const useConfig = () => config
export default config

// Utils
function deepFreeze (object: Record<string, any>) {
  const propNames = Object.getOwnPropertyNames(object)
  for (const name of propNames) {
    const value = object[name]
    if (value && typeof value === 'object') {
      deepFreeze(value)
    }
  }
  return Object.freeze(object)
}
