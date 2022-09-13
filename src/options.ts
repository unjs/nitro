import { resolve, join } from 'pathe'
import { loadConfig } from 'c12'
import { klona } from 'klona/full'
import { camelCase } from 'scule'
import { defu } from 'defu'
import { resolveModuleExportNames, resolvePath as resovleModule } from 'mlly'
// import escapeRE from 'escape-string-regexp'
import { withLeadingSlash, withoutTrailingSlash, withTrailingSlash } from 'ufo'
import { isTest } from 'std-env'
import { findWorkspaceDir } from 'pkg-types'
import { resolvePath, detectTarget } from './utils'
import type { NitroConfig, NitroOptions } from './types'
import { runtimeDir, pkgDir } from './dirs'
import * as PRESETS from './presets'
import { nitroImports } from './imports'

const NitroDefaults: NitroConfig = {
  // General
  preset: undefined,
  logLevel: isTest ? 1 : 3,
  runtimeConfig: { app: {}, nitro: {} },

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
  storage: {},
  devStorage: {},
  bundledStorage: [],
  publicAssets: [],
  serverAssets: [],
  plugins: [],
  imports: {
    exclude: [/[\\/]node_modules[\\/]/, /[\\/]\.git[\\/]/],
    presets: nitroImports
  },
  virtual: {},
  compressPublicAssets: false,

  // Dev
  dev: false,
  devServer: { watch: [] },
  watchOptions: { ignoreInitial: true },

  // Routing
  baseURL: process.env.NITRO_APP_BASE_URL || '/',
  handlers: [],
  devHandlers: [],
  errorHandler: '#internal/nitro/error',
  routes: {},
  prerender: {
    crawlLinks: false,
    ignore: [],
    routes: []
  },

  // Rollup
  alias: {
    '#internal/nitro': runtimeDir
  },
  unenv: {},
  analyze: false,
  moduleSideEffects: [
    'unenv/runtime/polyfill/',
    'node-fetch-native/polyfill',
    'node-fetch-native/dist/polyfill'
  ],
  replace: {},
  node: true,
  sourceMap: true,

  // Advanced
  typescript: {
    generateTsConfig: true,
    internalPaths: false
  },
  nodeModulesDirs: [],
  hooks: {},
  commands: {}
}

export async function loadOptions (userConfig: NitroConfig = {}): Promise<NitroOptions> {
  // Detect preset
  let preset = process.env.NITRO_PRESET || userConfig.preset || detectTarget() || 'node-server'
  if (userConfig.dev) {
    preset = 'nitro-dev'
  }

  // Load configuration and preset
  userConfig = klona(userConfig)
  const { config } = await loadConfig({
    name: 'nitro',
    defaults: NitroDefaults,
    cwd: userConfig.rootDir,
    dotenv: userConfig.dev,
    extend: { extendKey: ['extends', 'preset'] },
    resolve (id: string) {
      type PT = Map<String, NitroConfig>
      let matchedPreset = (PRESETS as any as PT)[id] || (PRESETS as any as PT)[camelCase(id)]
      if (matchedPreset) {
        if (typeof matchedPreset === 'function') {
          matchedPreset = matchedPreset()
        }
        return {
          config: matchedPreset
        }
      }
      return null
    },
    overrides: {
      ...userConfig,
      preset
    }
  })
  const options = klona(config) as NitroOptions
  options._config = userConfig
  options.preset = preset

  options.rootDir = resolve(options.rootDir || '.')
  options.workspaceDir = await findWorkspaceDir(options.rootDir)
  options.srcDir = resolve(options.srcDir || options.rootDir)
  for (const key of ['srcDir', 'publicDir', 'buildDir']) {
    options[key] = resolve(options.rootDir, options[key])
  }

  // Add aliases
  options.alias = {
    ...options.alias,
    '~/': join(options.srcDir, '/'),
    '@/': join(options.srcDir, '/'),
    '~~/': join(options.rootDir, '/'),
    '@@/': join(options.rootDir, '/')
  }

  // Resolve possibly template paths
  if (!options.entry) {
    throw new Error(`Nitro entry is missing! Is "${options.preset}" preset correct?`)
  }
  options.entry = resolvePath(options.entry, options)
  options.output.dir = resolvePath(options.output.dir, options)
  options.output.publicDir = resolvePath(options.output.publicDir, options)
  options.output.serverDir = resolvePath(options.output.serverDir, options)

  options.nodeModulesDirs.push(resolve(options.workspaceDir, 'node_modules'))
  options.nodeModulesDirs.push(resolve(options.rootDir, 'node_modules'))
  options.nodeModulesDirs.push(resolve(pkgDir, 'node_modules'))
  options.nodeModulesDirs = Array.from(new Set(options.nodeModulesDirs))

  if (!options.scanDirs.length) {
    options.scanDirs = [options.srcDir]
  }

  // Backward compatibility for options.autoImports
  // TODO: Remove in major release
  if (options.autoImport === false) {
    options.imports = false
  } else if (options.imports !== false) {
    options.imports = options.autoImport = defu(options.imports, options.autoImport)
  }

  if (options.imports && Array.isArray(options.imports.exclude)) {
    options.imports.exclude.push(options.buildDir)
  }

  // Add h3 auto imports preset
  if (options.imports) {
    const h3Exports = await resolveModuleExportNames('h3', { url: import.meta.url })
    options.imports.presets.push({
      from: 'h3',
      imports: h3Exports.filter(n => !n.match(/^[A-Z]/) && n !== 'use')
    })
  }

  options.baseURL = withLeadingSlash(withTrailingSlash(options.baseURL))
  options.runtimeConfig = defu(options.runtimeConfig, {
    app: {
      baseURL: options.baseURL
    },
    nitro: {
      routes: options.routes
    }
  })

  for (const asset of options.publicAssets) {
    asset.dir = resolve(options.srcDir, asset.dir)
    asset.baseURL = withLeadingSlash(withoutTrailingSlash(asset.baseURL || '/'))
  }

  for (const pkg of ['defu', 'h3']) {
    if (!options.alias[pkg]) {
      options.alias[pkg] = await resovleModule(pkg, { url: import.meta.url })
    }
  }

  // Build-only storage
  const fsMounts = {
    root: resolve(options.rootDir),
    src: resolve(options.srcDir),
    build: resolve(options.buildDir),
    cache: resolve(options.buildDir, 'cache')
  }
  for (const p in fsMounts) {
    options.devStorage[p] = options.devStorage[p] || { driver: 'fs', base: fsMounts[p] }
  }

  // Resolve plugin paths
  options.plugins = options.plugins.map(p => resolvePath(p, options))

  return options
}

export function defineNitroConfig (config: NitroConfig): NitroConfig {
  return config
}
