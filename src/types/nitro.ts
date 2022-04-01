/* eslint-disable no-use-before-define */
import type { Preset as UnenvPreset } from 'unenv'
import type { Unimport, UnimportOptions } from 'unimport'
import type { PluginVisualizerOptions } from 'rollup-plugin-visualizer'
import type { NestedHooks, Hookable } from 'hookable'
import type { Consola, LogLevel } from 'consola'
import type { NodeExternalsOptions } from '../rollup/plugins/externals'
import type { StorageOptions } from '../rollup/plugins/storage'
import type { RollupConfig } from '../rollup/config'
import type { Options as EsbuildOptions } from '../rollup/plugins/esbuild'
import { NitroHandlerConfig } from './handler'

export interface Nitro {
  options: NitroOptions,
  scannedHandlers: NitroHandlerConfig[],
  vfs: Record<string, string>
  hooks: Hookable<NitroHooks>
  unimport?: Unimport
  logger: Consola
}

export interface NitroHooks {
  'nitro:document': (htmlTemplate: { src: string, contents: string, dst: string }) => void
  'nitro:rollup:before': (nitro: Nitro) => void | Promise<void>
  'nitro:compiled': (nitro: Nitro) => void
  'nitro:dev:reload': () => void
  'close': () => void
}

type DeepPartial<T> = T extends Record<string, any> ? { [P in keyof T]?: DeepPartial<T[P]> | T[P] } : T

export type NitroPreset = NitroConfig | ((input: NitroConfig) => NitroConfig)

export interface NitroConfig extends DeepPartial<NitroOptions> {
  extends?: string | string[]
}

export interface NitroRouteRule {
  swr?: number
  redirect?: string
}

export interface PublicAssetDir {
  baseURL?: string
  fallthrough?: boolean
  maxAge: number
  dir: string
}

export interface ServerAssetDir {
  baseName: string
  dir: string
}

export interface NitroOptions {
  // Internal
  _config: NitroConfig

  // General
  dev: boolean
  preset: string
  logLevel: LogLevel

  // App
  runtimeConfig: { public: any, private: any }
  app: {
    baseURL: string,
    cdnURL: string,
    buildAssetsDir: string
  }

  // Dirs
  rootDir: string
  srcDir: string
  scanDirs: string[]
  buildDir: string
  output: {
    dir: string
    serverDir: string
    publicDir: string
  }

  // Features
  storage: StorageOptions
  timing: boolean
  renderer: string
  serveStatic: boolean
  experimental?: {
    wasm?: boolean
  }
  serverAssets: ServerAssetDir[]
  publicAssets: PublicAssetDir[]

  // Routing
  handlers: NitroHandlerConfig[]
  routes: {
    [path: string]: NitroRouteRule
  },
  prerender: {
    crawlLinks: boolean
    routes: string[]
  }

  // Rollup
  entry: string
  unenv: UnenvPreset
  alias: Record<string, string>
  minify: boolean
  inlineDynamicImports: boolean
  sourceMap: boolean
  node: boolean
  rollupConfig?: RollupConfig
  moduleSideEffects: string[]
  autoImport: UnimportOptions
  esbuild?: {
    options?: EsbuildOptions
  }
  externals: boolean | NodeExternalsOptions
  analyze: false | PluginVisualizerOptions
  replace: Record<string, string | ((id: string) => string)>

  // Advanced
  hooks: NestedHooks<NitroHooks>
  nodeModulesDirs: string[]
  commands: {
    preview: string
    deploy: string
  }
}
