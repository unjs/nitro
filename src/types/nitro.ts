/* eslint-disable no-use-before-define */
import type { Preset as UnenvPreset } from "unenv";
import type { Unimport } from "unimport";
import type { UnimportPluginOptions } from "unimport/unplugin";
import type { PluginVisualizerOptions } from "rollup-plugin-visualizer";
import type { NestedHooks, Hookable } from "hookable";
import type { ConsolaInstance, LogLevel } from "consola";
import type { WatchOptions } from "chokidar";
import type { RollupCommonJSOptions } from "@rollup/plugin-commonjs";
import type { RollupWasmOptions } from "@rollup/plugin-wasm";
import type { Storage, BuiltinDriverName } from "unstorage";
import type { ProxyServerOptions } from "httpxy";
import type { ProxyOptions } from "h3";
import type { ResolvedConfig, ConfigWatcher } from "c12";
import type { TSConfig } from "pkg-types";
import type { NodeExternalsOptions } from "../rollup/plugins/externals";
import type { RollupConfig } from "../rollup/config";
import type { Options as EsbuildOptions } from "../rollup/plugins/esbuild";
import { CachedEventHandlerOptions } from "../runtime/types";
import type * as _PRESETS from "../presets";
import type {
  NitroErrorHandler,
  NitroDevEventHandler,
  NitroEventHandler,
} from "./handler";
import type { PresetOptions } from "./presets";
import type { KebabCase } from "./utils";

export type NitroDynamicConfig = Pick<
  NitroConfig,
  "runtimeConfig" | "routeRules"
>;

export interface NitroRuntimeConfigApp {
  baseURL: string;
  [key: string]: any;
}

export interface NitroRuntimeConfig {
  app: NitroRuntimeConfigApp;
  nitro: {
    envPrefix?: string;
    routeRules?: {
      [path: string]: NitroRouteConfig;
    };
  };
  [key: string]: any;
}

export interface Nitro {
  options: NitroOptions;
  scannedHandlers: NitroEventHandler[];
  vfs: Record<string, string>;
  hooks: Hookable<NitroHooks>;
  unimport?: Unimport;
  logger: ConsolaInstance;
  storage: Storage;
  close: () => Promise<void>;
  updateConfig: (config: NitroDynamicConfig) => void | Promise<void>;

  /* @internal */
  _prerenderedRoutes?: PrerenderRoute[];
  _prerenderMeta?: Record<string, { contentType?: string }>;
}

export interface PrerenderRoute {
  route: string;
  contents?: string;
  data?: ArrayBuffer;
  fileName?: string;
  error?: Error & { statusCode: number; statusMessage: string };
  generateTimeMS?: number;
  skip?: boolean;
  contentType?: string;
}

/** @deprecated Internal type will be removed in future versions */
export type PrerenderGenerateRoute = PrerenderRoute;

type HookResult = void | Promise<void>;
export interface NitroHooks {
  "rollup:before": (nitro: Nitro, config: RollupConfig) => HookResult;
  compiled: (nitro: Nitro) => HookResult;
  "dev:reload": () => HookResult;
  "rollup:reload": () => HookResult;
  restart: () => HookResult;
  close: () => HookResult;
  // Prerender
  "prerender:routes": (routes: Set<string>) => HookResult;
  "prerender:config": (config: NitroConfig) => HookResult;
  "prerender:init": (prerenderer: Nitro) => HookResult;
  "prerender:generate": (route: PrerenderRoute, nitro: Nitro) => HookResult;
  "prerender:route": (route: PrerenderRoute) => HookResult;
  "prerender:done": (result: {
    prerenderedRoutes: PrerenderRoute[];
    failedRoutes: PrerenderRoute[];
  }) => HookResult;
}

type CustomDriverName = string & { _custom?: any };

export interface StorageMounts {
  [path: string]: {
    driver: BuiltinDriverName | CustomDriverName;
    [option: string]: any;
  };
}

type DeepPartial<T> = T extends Record<string, any>
  ? { [P in keyof T]?: DeepPartial<T[P]> | T[P] }
  : T;

export type NitroPreset = NitroConfig | (() => NitroConfig);

export interface NitroConfig
  extends DeepPartial<Omit<NitroOptions, "routeRules" | "rollupConfig">> {
  extends?: string | string[] | NitroPreset;
  routeRules?: { [path: string]: NitroRouteConfig };
  rollupConfig?: Partial<RollupConfig>;
}

export interface AppConfig {
  [key: string]: any;
}

export interface PublicAssetDir {
  baseURL?: string;
  fallthrough?: boolean;
  maxAge: number;
  dir: string;
}

export interface ServerAssetDir {
  baseName: string;
  dir: string;
}

export interface DevServerOptions {
  watch: string[];
}

export interface CompressOptions {
  gzip?: boolean;
  brotli?: boolean;
}

type Enumerate<
  N extends number,
  Acc extends number[] = [],
> = Acc["length"] extends N
  ? Acc[number]
  : Enumerate<N, [...Acc, Acc["length"]]>;
type IntRange<F extends number, T extends number> = Exclude<
  Enumerate<T>,
  Enumerate<F>
>;
type HTTPStatusCode = IntRange<100, 600>;

type ExcludeFunctions<G extends Record<string, any>> = Pick<
  G,
  // eslint-disable-next-line @typescript-eslint/ban-types
  { [P in keyof G]: NonNullable<G[P]> extends Function ? never : P }[keyof G]
>;

export interface NitroRouteConfig {
  cache?: ExcludeFunctions<CachedEventHandlerOptions> | false;
  headers?: Record<string, string>;
  redirect?: string | { to: string; statusCode?: HTTPStatusCode };
  prerender?: boolean;
  proxy?: string | ({ to: string } & ProxyOptions);
  isr?: number | boolean;

  // Shortcuts
  cors?: boolean;
  swr?: boolean | number;
  static?: boolean | number;
}

export interface NitroRouteRules
  extends Omit<NitroRouteConfig, "redirect" | "cors" | "swr" | "static"> {
  redirect?: { to: string; statusCode: HTTPStatusCode };
  proxy?: { to: string } & ProxyOptions;
}

export interface WasmOptions {
  /**
   * Direct import the wasm file instead of bundling, required in Cloudflare Workers
   *
   * @default false
   */
  esmImport?: boolean;

  /**
   * Options for `@rollup/plugin-wasm`, only used when `esmImport` is `false`
   */
  rollup?: RollupWasmOptions;
}

export interface NitroOptions extends PresetOptions {
  // Internal
  _config: NitroConfig;
  _c12: ResolvedConfig<NitroConfig> | ConfigWatcher<NitroConfig>;

  // General
  debug: boolean;
  // eslint-disable-next-line @typescript-eslint/ban-types
  preset: KebabCase<keyof typeof _PRESETS> | (string & {});
  static: boolean;
  logLevel: LogLevel;
  runtimeConfig: NitroRuntimeConfig;
  appConfig: AppConfig;
  appConfigFiles: string[];

  // Dirs
  workspaceDir: string;
  rootDir: string;
  srcDir: string;
  scanDirs: string[];
  buildDir: string;
  output: {
    dir: string;
    serverDir: string;
    publicDir: string;
  };

  // Features
  storage: StorageMounts;
  devStorage: StorageMounts;
  bundledStorage: string[];
  timing: boolean;
  renderer?: string;
  serveStatic: boolean | "node" | "deno";
  noPublicDir: boolean;
  /** @experimental Requires `experimental.wasm` to be effective */
  wasm?: WasmOptions;
  experimental?: {
    legacyExternals?: boolean;
    openAPI?: boolean;
    /**
     * See https://github.com/microsoft/TypeScript/pull/51669
     */
    typescriptBundlerResolution?: boolean;
    /**
     * Enable native async context support for useEvent()
     */
    asyncContext?: boolean;
    /**
     * Enable Experimental WebAssembly Support
     */
    wasm?: boolean;
    /**
     * Disable Experimental bundling of Nitro Runtime Dependencies
     */
    bundleRuntimeDependencies?: false;
    /**
     * Disable Experimental Sourcemap Minification
     */
    sourcemapMinify?: false;
    /**
     * Backward compatibility support for Node fetch (required for Node < 18)
     */
    nodeFetchCompat?: boolean;
  };
  future: {
    nativeSWR: boolean;
  };
  serverAssets: ServerAssetDir[];
  publicAssets: PublicAssetDir[];

  imports: UnimportPluginOptions | false;
  plugins: string[];
  virtual: Record<string, string | (() => string | Promise<string>)>;
  compressPublicAssets: boolean | CompressOptions;
  ignore: string[];

  // Dev
  dev: boolean;
  devServer: DevServerOptions;
  watchOptions: WatchOptions;
  devProxy: Record<string, string | ProxyServerOptions>;

  // Logging
  logging: {
    compressedSizes: boolean;
  };

  // Routing
  baseURL: string;
  handlers: NitroEventHandler[];
  routeRules: { [path: string]: NitroRouteRules };
  devHandlers: NitroDevEventHandler[];
  errorHandler: string;
  devErrorHandler: NitroErrorHandler;
  prerender: {
    /**
     * Prerender HTML routes within subfolders (`/test` would produce `/test/index.html`)
     */
    autoSubfolderIndex: boolean;
    concurrency: number;
    interval: number;
    crawlLinks: boolean;
    failOnError: boolean;
    ignore: string[];
    routes: string[];
    /**
     * Amount of retries. Pass Infinity to retry indefinitely.
     * @default 3
     */
    retry: number;
    /**
     * Delay between each retry in ms.
     * @default 500
     */
    retryDelay: number;
  };

  // Rollup
  rollupConfig?: RollupConfig;
  entry: string;
  unenv: UnenvPreset;
  alias: Record<string, string>;
  minify: boolean;
  inlineDynamicImports: boolean;
  sourceMap: boolean | "inline" | "hidden";
  node: boolean;
  moduleSideEffects: string[];
  esbuild?: {
    options?: Partial<EsbuildOptions>;
  };
  noExternals: boolean;
  externals: NodeExternalsOptions;
  analyze: false | PluginVisualizerOptions;
  replace: Record<string, string | ((id: string) => string)>;
  commonJS?: RollupCommonJSOptions;
  exportConditions?: string[];

  // Advanced
  typescript: {
    strict?: boolean;
    internalPaths?: boolean;
    generateTsConfig?: boolean;
    /** the path of the generated `tsconfig.json`, relative to buildDir */
    tsconfigPath: string;
    tsConfig?: Partial<TSConfig>;
  };
  hooks: NestedHooks<NitroHooks>;
  nodeModulesDirs: string[];
  commands: {
    preview: string;
    deploy: string;
  };

  // Framework
  framework: {
    // eslint-disable-next-line @typescript-eslint/ban-types
    name?: "nitro" | (string & {});
    version?: string;
  };

  // IIS
  iis?: {
    mergeConfig?: boolean;
    overrideConfig?: boolean;
  };
}

declare global {
  const defineNitroConfig: (config: NitroConfig) => NitroConfig;
}
