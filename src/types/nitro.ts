/* eslint-disable no-use-before-define */
import type { Preset as UnenvPreset } from 'unenv'
import type { Unimport } from 'unimport'
import type { UnimportPluginOptions } from 'unimport/unplugin'
import type { PluginVisualizerOptions } from 'rollup-plugin-visualizer'
import type { NestedHooks, Hookable } from 'hookable'
import type { Consola, LogLevel } from 'consola'
import type { WatchOptions } from 'chokidar'
import type { RollupCommonJSOptions } from '@rollup/plugin-commonjs'
import type { RollupWasmOptions } from '@rollup/plugin-wasm'
import type { Storage, BuiltinDriverName } from 'unstorage'
import type { NodeExternalsOptions } from '../rollup/plugins/externals'
import type { RollupConfig } from '../rollup/config'
import type { Options as EsbuildOptions } from '../rollup/plugins/esbuild'
import type { NitroErrorHandler, NitroDevEventHandler, NitroEventHandler } from './handler'
import type { PresetOptions } from './presets'

export interface Nitro {
  options: NitroOptions,
  scannedHandlers: NitroEventHandler[],
  vfs: Record<string, string>
  hooks: Hookable<NitroHooks>
  unimport?: Unimport
  logger: Consola
  storage: Storage
  close: () => Promise<void>

  /* @internal */
  _prerenderedRoutes?: PrerenderGenerateRoute[]
}

export interface PrerenderRoute {
  route: string
  contents?: string
  data?: ArrayBuffer
  fileName?: string
  error?: Error & { statusCode: number, statusMessage: string }
  generateTimeMS?: number
}

export interface PrerenderGenerateRoute extends PrerenderRoute {
  skip?: boolean
}

type HookResult = void | Promise<void>
export interface NitroHooks {
  'rollup:before': (nitro: Nitro) => HookResult
  'compiled': (nitro: Nitro) => HookResult
  'dev:reload': () => HookResult
  'close': () => HookResult
  'prerender:route': (route: PrerenderRoute) => HookResult
  'prerender:generate': (route: PrerenderGenerateRoute, nitro: Nitro) => HookResult
}

type CustomDriverName = string & { _custom?: any }

export interface StorageMounts {
  [path: string]: { driver: BuiltinDriverName | CustomDriverName, [option: string]: any }
}

type DeepPartial<T> = T extends Record<string, any> ? { [P in keyof T]?: DeepPartial<T[P]> | T[P] } : T

export type NitroPreset = NitroConfig | (() => NitroConfig)

export interface NitroConfig extends DeepPartial<NitroOptions> {
  extends?: string | string[] | NitroPreset
}

export interface NitroRouteOption {
  swr?: boolean | number
  redirect?: string | { to: string, statusCode?: 301 | 302 | 307 | 308 }
  headers?: Record<string, string>
  cors?: boolean
}

export interface NitroRoutesOptions {
  [path: string]: NitroRouteOption
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

export interface DevServerOptions {
  watch: string[]
}

export interface CompressOptions {
  gzip?: boolean
  brotli?: boolean
}

export interface NitroOptions extends PresetOptions {
  // Internal
  _config: NitroConfig

  // General
  preset: string
  logLevel: LogLevel
  runtimeConfig: {
    app: {
      baseURL: string
    },
    nitro: {
      /** @deprecated Use top-level routes option! */
      routes: NitroRoutesOptions
    }
    [key: string]: any
  }

  // Dirs
  workspaceDir: string
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
  storage: StorageMounts
  devStorage: StorageMounts
  bundledStorage: string[]
  timing: boolean
  renderer: string
  serveStatic: boolean
  experimental?: {
    wasm?: boolean | RollupWasmOptions
  }
  serverAssets: ServerAssetDir[]
  publicAssets: PublicAssetDir[]
  /**
   * @deprecated Please use `imports` option
   */
  autoImport: UnimportPluginOptions | false
  imports: UnimportPluginOptions | false
  plugins: string[]
  virtual: Record<string, string | (() => string | Promise<string>)>
  compressPublicAssets: boolean | CompressOptions

  // Dev
  dev: boolean
  devServer: DevServerOptions
  watchOptions: WatchOptions

  // Routing
  baseURL: string,
  handlers: NitroEventHandler[]
  routes: NitroRoutesOptions
  devHandlers: NitroDevEventHandler[]
  errorHandler: string
  devErrorHandler: NitroErrorHandler
  prerender: {
    crawlLinks: boolean
    ignore: string[]
    routes: string[]
  }

  // Rollup
  rollupConfig?: RollupConfig
  entry: string
  unenv: UnenvPreset
  alias: Record<string, string>
  minify: boolean
  inlineDynamicImports: boolean
  sourceMap: boolean
  node: boolean
  moduleSideEffects: string[]
  esbuild?: {
    options?: Partial<EsbuildOptions>
  }
  noExternals: boolean,
  externals: NodeExternalsOptions
  analyze: false | PluginVisualizerOptions
  replace: Record<string, string | ((id: string) => string)>
  commonJS?: RollupCommonJSOptions

  // Advanced
  typescript: {
    internalPaths?: boolean
    generateTsConfig?: boolean
  }
  hooks: NestedHooks<NitroHooks>
  nodeModulesDirs: string[]
  commands: {
    preview: string
    deploy: string
  }
}
