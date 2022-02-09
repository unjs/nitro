/* eslint-disable no-use-before-define */
import type { Preset as UnenvPreset } from 'unenv'
import type { PluginVisualizerOptions } from 'rollup-plugin-visualizer'
import type { NestedHooks, Hookable } from 'hookable'
import type { NodeExternalsOptions } from '../rollup/plugins/externals'
import type { StorageOptions } from '../rollup/plugins/storage'
import type { AssetOptions } from '../rollup/plugins/assets'
import type { ServerMiddleware } from '../server/middleware'
import type { RollupConfig } from '../rollup/config'
import type { Options as EsbuildOptions } from '../rollup/plugins/esbuild'

export interface Nitro {
  options: NitroOptions,
  scannedMiddleware: NitroOptions['middleware'],
  vfs: Record<string, string>
  hooks: Hookable<NitroHooks>
}

export interface NitroHooks {
  'nitro:document': (htmlTemplate: { src: string, contents: string, dst: string }) => void
  'nitro:rollup:before': (nitro: Nitro) => void | Promise<void>
  'nitro:compiled': (nitro: Nitro) => void
  'nitro:dev:reload': () => void
  'close': () => void
}

type DeepPartial<T> = T extends Record<string, any> ? { [P in keyof T]?: DeepPartial<T[P]> | T[P] } : T
type NitroPreset = string | NitroConfig | ((input: NitroConfig) => NitroConfig)

export interface NitroConfig extends DeepPartial<NitroOptions> {
  extends?: NitroPreset
  preset?: NitroPreset
}

export interface NitroOptions {
  unenv: UnenvPreset

  rootDir: string
  srcDir: string
  buildDir: string
  generateDir: string
  publicDir: string
  srcDir: string
  modulesDir: string[]
  entry: string

  routerBase: string
  publicPath: string
  staticAssets: any

  hooks: NestedHooks<NitroHooks>

  middleware: ServerMiddleware[]

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
    preview: string | ((config: NitroContext) => string)
    deploy: string | ((config: NitroContext) => string)
  }
}
