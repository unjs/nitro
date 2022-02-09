import defu from 'defu'
import { resolve } from 'pathe'
import type { NitroConfig, NitroOptions } from './types'
import { runtimeDir, pkgDir } from './dirs'
import * as PRESETS from './presets'
import { tryImport, detectTarget } from './utils'

const defaultNitroConfig = () => ({
  alias: {
    '#nitro': runtimeDir
  },
  unenv: {},
  analyze: false,
  experiments: {},
  moduleSideEffects: ['unenv/runtime/polyfill/'],
  middleware: [],
  modulesDir: [],
  ignore: [],
  hooks: {},
  output: {
    dir: '{{ rootDir }}/.output',
    serverDir: '{{ output.dir }}/server',
    publicDir: '{{ output.dir }}/public'
  },
  storage: { mounts: {} },
  commands: {},
  assets: {
    // inline: !config.dev,
    dirs: {}
  },
  publicDir: 'public',
  srcDir: undefined,
  routerBase: '/',
  publicPath: '/',
  runtimeConfig: {
    public: {
      app: {
        baseURL: '/',
        cdnURL: undefined,
        buildAssetsDir: '_dist'
      }
    },
    private: {}
  }
}) as NitroConfig

export function loadOptions (config: NitroConfig = {}): NitroOptions {
  // Apply nitro defaults
  config = defu(config, defaultNitroConfig())

  // Apply preset defaults
  config.extends = config.preset = process.env.NITRO_PRESET || config.extends || config.preset || detectTarget() || 'server'
  config = extendConfig(config)

  // Normalize options
  const options = config as NitroOptions
  options.rootDir = resolve(options.rootDir || '.')
  options.srcDir = resolve(options.srcDir || options.rootDir)
  for (const key of ['srcDir', 'publicDir', 'generateDir', 'buildDir']) {
    options[key] = resolve(options.rootDir, options[key])
  }
  options.modulesDir.push(resolve(options.rootDir, 'node_modules'))
  options.modulesDir.push(resolve(pkgDir, 'node_modules'))

  return options
}

function extendConfig (config: NitroConfig): NitroConfig {
  if (!config.extends) {
    return config
  }

  let _extends = config.extends
  if (typeof config.extends === 'string') {
    type Preset = NitroConfig['preset']
    _extends = (PRESETS as Record<string, Preset>)[config.extends] || tryImport(config.rootDir, config.extends) || {}
    if (!_extends) {
      throw new Error('Cannot resolve config: ' + config.extends)
    }
    _extends = (_extends as any).default || _extends
  }
  if (typeof _extends === 'function') {
    _extends = _extends(config)
  }

  // TODO: Merge hooks
  const preset = extendConfig(_extends as NitroConfig)
  return defu(config, preset)
}
