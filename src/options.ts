import { resolve } from 'pathe'
import { loadConfig } from 'c12'
import { klona } from 'klona/full'
import defu from 'defu'
import { withLeadingSlash, withoutTrailingSlash } from 'ufo'
import { resolvePath, detectTarget } from './utils'
import type { NitroConfig, NitroOptions } from './types'
import { runtimeDir, pkgDir } from './dirs'
import * as PRESETS from './presets'

const NitroDefaults: NitroConfig = {
  // General
  preset: undefined,
  logLevel: 3,
  runtimeConfig: {
    nitro: {
      baseURL: '/',
      cdnURL: undefined,
      buildAssetsDir: 'dist'
    }
  },

  // Dirs
  scanDirs: [],
  buildDir: '.nitro',
  output: {
    dir: '{{ rootDir }}/.output',
    serverDir: '{{ output.dir }}/server',
    publicDir: '{{ output.dir }}/public'
  },

  // Featueres
  experimental: {},
  storage: { mounts: {} },
  publicAssets: [],
  serverAssets: [],

  // Dev
  dev: false,
  devServer: { watch: [] },
  watchOptions: { ignoreInitial: true },

  // Routing
  handlers: [],
  devHandlers: [],
  routes: {},
  prerender: {
    crawlLinks: false,
    routes: []
  },

  // Rollup
  alias: {
    '#nitro': runtimeDir
  },
  unenv: {},
  analyze: false,
  moduleSideEffects: ['unenv/runtime/polyfill/'],
  replace: {},

  // Advanced
  nodeModulesDirs: [],
  hooks: {},
  commands: {}
}

export async function loadOptions (userConfig: NitroConfig = {}): Promise<NitroOptions> {
  userConfig = klona(userConfig)

  const { config } = await loadConfig({
    name: 'nitro',
    defaults: NitroDefaults,
    cwd: userConfig.rootDir,
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
      ...userConfig,
      extends: [
        userConfig.preset || process.env.NITRO_PRESET || detectTarget() || 'server'
      ]
    }
  })
  const options = klona(config) as NitroOptions
  options._config = userConfig

  options.rootDir = resolve(options.rootDir || '.')
  options.srcDir = resolve(options.srcDir || options.rootDir)
  for (const key of ['srcDir', 'publicDir', 'buildDir']) {
    options[key] = resolve(options.rootDir, options[key])
  }

  // Resolve possibly template paths
  options.entry = resolvePath(options.entry, options)
  options.output.dir = resolvePath(options.output.dir, options)
  options.output.publicDir = resolvePath(options.output.publicDir, options)
  options.output.serverDir = resolvePath(options.output.serverDir, options)

  options.nodeModulesDirs.push(resolve(options.rootDir, 'node_modules'))
  options.nodeModulesDirs.push(resolve(pkgDir, 'node_modules'))
  options.nodeModulesDirs = Array.from(new Set(options.nodeModulesDirs))

  if (!options.scanDirs.length) {
    options.scanDirs = [options.srcDir]
  }

  options.runtimeConfig = defu(options.runtimeConfig, {
    app: {
      routes: options.routes
    }
  })

  for (const asset of options.publicAssets) {
    asset.dir = resolve(options.srcDir, asset.dir)
    asset.baseURL = withLeadingSlash(withoutTrailingSlash(asset.baseURL || '/'))
  }

  return options
}

export function defineNitroConfig (config: NitroConfig): NitroConfig {
  return config
}
