import destr from 'destr'
import { snakeCase } from 'scule'
import { isObject } from '../utils'

// Bundled runtime config (injected by nitro)
const _runtimeConfig = process.env.RUNTIME_CONFIG as any

const ENV_PREFIX = 'NITRO_'
const ENV_PREFIX_ALT = _runtimeConfig.nitro.envPrefix ?? process.env.NITRO_ENV_PREFIX ?? '_'

// Allow override from process.env and deserialize
const getEnv = (key: string) => {
  const envKey = snakeCase(key).toUpperCase()
  return destr(process.env[ENV_PREFIX + envKey] ?? process.env[ENV_PREFIX_ALT + envKey])
}

function overrideConfig (obj: object, parentKey: string = '') {
  for (const key in obj) {
    const subKey = parentKey ? `${parentKey}_${key}` : key
    const envValue = getEnv(subKey)
    if (isObject(obj[key])) {
      if (isObject(envValue)) {
        obj[key] = { ...obj[key], ...envValue }
      }
      overrideConfig(obj[key], subKey)
    } else {
      obj[key] = envValue ?? obj[key]
    }
  }
}
overrideConfig(_runtimeConfig)

// Named exports
const config = deepFreeze(_runtimeConfig)
export const useRuntimeConfig = () => config
export default config

// Utils
function deepFreeze (object: Record<string, any>) {
  const propNames = Object.getOwnPropertyNames(object)
  for (const name of propNames) {
    const value = object[name]
    if (isObject(value)) {
      deepFreeze(value)
    }
  }
  return Object.freeze(object)
}
