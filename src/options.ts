import { resolve } from 'pathe'
import { loadConfig } from 'c12'
import type { NitroConfig, NitroOptions } from './types'
import { runtimeDir, pkgDir } from './dirs'
import * as PRESETS from './presets'
import { detectTarget } from './utils'

const NitroDefaults: NitroConfig = {
  alias: {
    '#nitro': runtimeDir
  },
  unenv: {},
  analyze: false,
  experiments: {},
  moduleSideEffects: ['unenv/runtime/polyfill/'],
  scanDirs: [],
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
  routes: {},
  prerender: {
    routes: []
  },
  publicDir: 'public',
  buildDir: 'dist',
  generateDir: 'dist',
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

export async function loadOptions (overrideConfig: NitroConfig = {}): Promise<NitroOptions> {
  const { config } = await loadConfig({
    name: 'nitro',
    defaults: NitroDefaults,
    cwd: overrideConfig.rootDir,
    resolve (id: string) {
      type PT = Map<String, NitroConfig>
      if ((PRESETS as any as PT)[id]) {
        return {
          config: (PRESETS as any as PT)[id]
        }
      }
      return null
    },
    overrides: {
      ...overrideConfig,
      extends: [
        overrideConfig.preset || process.env.NITRO_PRESET || detectTarget() || 'server'
      ]
    }
  })

  // Normalize options
  const options = config as NitroOptions
  options.rootDir = resolve(options.rootDir || '.')
  options.srcDir = resolve(options.srcDir || options.rootDir)
  for (const key of ['srcDir', 'publicDir', 'generateDir', 'buildDir']) {
    options[key] = resolve(options.rootDir, options[key])
  }
  options.modulesDir.push(resolve(options.rootDir, 'node_modules'))
  options.modulesDir.push(resolve(pkgDir, 'node_modules'))
  if (!options.scanDirs.length) {
    options.scanDirs = [options.srcDir]
  }

  // Dev-only storage
  if (options.dev) {
    const fsMounts = {
      root: resolve(options.rootDir),
      src: resolve(options.srcDir),
      build: resolve(options.buildDir),
      cache: resolve(options.rootDir, '.cache')
    }
    for (const p in fsMounts) {
      options.storage.mounts[p] = options.storage.mounts[p] || {
        driver: 'fs',
        driverOptions: { base: fsMounts[p] }
      }
    }
  }

  return options
}

export function defineNitroConfig (config: NitroConfig): NitroConfig {
  return config
}
