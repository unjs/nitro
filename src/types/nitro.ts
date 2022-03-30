/* eslint-disable no-use-before-define */
import type { Preset as UnenvPreset } from 'unenv'
import type { Unimport, UnimportOptions } from 'unimport'
import type { PluginVisualizerOptions } from 'rollup-plugin-visualizer'
import type { NestedHooks, Hookable } from 'hookable'
import type { NodeExternalsOptions } from '../rollup/plugins/externals'
import type { StorageOptions } from '../rollup/plugins/storage'
import type { AssetOptions } from '../rollup/plugins/assets'
import type { RollupConfig } from '../rollup/config'
import type { Options as EsbuildOptions } from '../rollup/plugins/esbuild'
import { NitroHandlerConfig } from './handler'

export interface Nitro {
  options: NitroOptions,
  scannedHandlers: NitroHandlerConfig[],
  vfs: Record<string, string>
  hooks: Hookable<NitroHooks>
  unimport?: Unimport
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

export interface NitroOptions {
  preset: string
  unenv: UnenvPreset

  rootDir: string
  srcDir: string
  scanDirs: string[]
  buildDir: string
  generateDir: string
  publicDir: string
  modulesDir: string[]
  entry: string

  routerBase: string
  publicPath: string
  staticAssets: any

  routes: {
    [path: string]: NitroRouteRule
  },

  prerender: {
    crawlLinks: boolean
    routes: string[]
  },

  hooks: NestedHooks<NitroHooks>

  handlers: NitroHandlerConfig[]

  storage: StorageOptions,
  assets: AssetOptions,

  ignore: string[]
  runtimeConfig: { public: any, private: any },
  alias: Record<string, string>
  renderer: string

  timing: boolean
  inlineDynamicImports: boolean
  minify: boolean
  sourceMap: boolean
  node: boolean
  dev: boolean
  ssr: boolean
  serveStatic: boolean
  externals: boolean | NodeExternalsOptions
  analyze: false | PluginVisualizerOptions

  rollupConfig?: RollupConfig
  moduleSideEffects: string[]
  esbuild?: {
    options?: EsbuildOptions
  }

  output: {
    dir: string
    serverDir: string
    publicDir: string
  },

  experiments?: {
    wasm?: boolean
  }

  commands: {
    preview: string | ((nitro: Nitro) => string)
    deploy: string | ((nitro: Nitro) => string)
  }

  autoImport: UnimportOptions
}
