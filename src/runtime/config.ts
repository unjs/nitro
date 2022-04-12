import destr from 'destr'
import { snakeCase } from 'scule'
import { createDefu } from 'defu'

// Bundled runtime config (injected by nitro)
const _runtimeConfig = process.env.RUNTIME_CONFIG as any

const ENV_PREFIX = 'NITRO_'
const ENV_PREFIX_ALT = _runtimeConfig.nitro.envPrefix ?? process.env.NITRO_ENV_PREFIX ?? '_'

// Allow override from process.env and deserialize
const getEnv = (key: string) => {
  const envKey = snakeCase(key).toUpperCase()
  return destr(process.env[ENV_PREFIX + envKey] ?? process.env[ENV_PREFIX_ALT + envKey])
}

const mergeWithEnvVariables = createDefu((obj: Record<string, any>, key: string, _value, namespace) => {
  // key: { subKey } can be overridden by KEY_SUB_KEY`
  const override = getEnv(namespace ? `${namespace}.${key}` : key)
  if (override !== undefined) {
    obj[key] = override
    return true
  }
})

// Named exports
const config = deepFreeze(mergeWithEnvVariables(_runtimeConfig, _runtimeConfig))
export const useRuntimeConfig = () => config
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
