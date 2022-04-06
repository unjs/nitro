import destr from 'destr'
import { snakeCase } from 'scule'

// Bundled runtime config (injected by nitro)
const _runtimeConfig = process.env.RUNTIME_CONFIG as any

// Allow override from process.env and deserialize
for (const key in _runtimeConfig) {
  // baseURL can be overridden by BASE_URL
  const envKey = snakeCase(key).toUpperCase()
  _runtimeConfig[key] = destr(process.env[envKey] || _runtimeConfig[key])
  if (_runtimeConfig[key] && typeof _runtimeConfig[key] === 'object') {
    for (const subkey in _runtimeConfig[key]) {
      // key: { subKey } can be overridden by KEY_SUB_KEY`
      const envKeyName = `${envKey}_${snakeCase(subkey).toUpperCase()}`
      _runtimeConfig[key][subkey] = destr(process.env[envKeyName]) || _runtimeConfig[key][subkey]
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
