import { resolve } from 'pathe'
import defu from 'defu'
import { createHooks } from 'hookable'
import { tryImport, resolvePath, detectTarget } from './utils'
import * as PRESETS from './presets'
import type { Nitro, NitroOptions, NitroConfig } from './types'
// import { mergeHooks } from 'hookable'
import { pkgDir, runtimeDir } from './dirs'

const nitroDefaults: NitroConfig = {
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
  serverDir: 'server',
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
}

export function createNitro (config: NitroConfig = {}): Nitro {
  // Apply nitro defaults
  config = defu(config, nitroDefaults)

  // Apply preset defaults
  config.extends = config.preset = config.extends || config.preset || process.env.NITRO_PRESET || detectTarget() || 'server'
  config = extendConfig(config)

  // Normalize options
  const options = config as NitroOptions
  options.rootDir = resolve(options.rootDir || '.')
  for (const key of ['srcDir', 'publicDir', 'serverDir', 'generateDir', 'buildDir']) {
    options[key] = resolve(options.rootDir, options[key])
  }
  options.modulesDir.push(resolve(options.rootDir, 'node_modules'))
  options.modulesDir.push(resolve(pkgDir, 'node_modules'))

  // Create context
  const nitro: Nitro = {
    options,
    hooks: createHooks(),
    vfs: {},
    scannedMiddleware: []
  }

  // Init hooks
  nitro.hooks.addHooks(nitro.options.hooks)

  // Resolve output dir
  options.output.dir = resolvePath(nitro, nitro.options.output.dir)
  options.output.publicDir = resolvePath(nitro, nitro.options.output.publicDir)
  options.output.serverDir = resolvePath(nitro, nitro.options.output.serverDir)

  // Dev-only storage
  if (nitro.options.dev) {
    const fsMounts = {
      root: resolve(nitro.options.rootDir),
      src: resolve(nitro.options.srcDir),
      build: resolve(nitro.options.buildDir),
      cache: resolve(nitro.options.rootDir, 'node_modules/.nitro/cache')
    }
    for (const p in fsMounts) {
      nitro.options.storage.mounts[p] = nitro.options.storage.mounts[p] || {
        driver: 'fs',
        driverOptions: { base: fsMounts[p] }
      }
    }
  }

  // Assets
  nitro.options.assets.dirs.server = {
    dir: resolve(nitro.options.srcDir, 'server/assets'), meta: true
  }

  return nitro
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

export function defineNitroPreset (preset: NitroConfig['extends']) {
  return preset
}
