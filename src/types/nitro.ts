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
import type { ServerOptions as HTTPProxyOptions } from "http-proxy";
import type { ProxyOptions } from "h3";
import type { ResolvedConfig, ConfigWatcher } from "c12";
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
  _prerenderedRoutes?: PrerenderGenerateRoute[];
}

export interface PrerenderRoute {
  route: string;
  contents?: string;
  data?: ArrayBuffer;
  fileName?: string;
  error?: Error & { statusCode: number; statusMessage: string };
  generateTimeMS?: number;
}

export interface PrerenderGenerateRoute extends PrerenderRoute {
  skip?: boolean;
}

type HookResult = void | Promise<void>;
export interface NitroHooks {
  "rollup:before": (nitro: Nitro, config: RollupConfig) => HookResult;
  compiled: (nitro: Nitro) => HookResult;
  "dev:reload": () => HookResult;
  "rollup:reload": () => HookResult;
  restart: () => HookResult;
  close: () => HookResult;
  "prerender:routes": (routes: Set<string>) => HookResult;
  "prerender:route": (route: PrerenderRoute) => HookResult;
  "prerender:generate": (
    route: PrerenderGenerateRoute,
    nitro: Nitro
  ) => HookResult;
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
  Acc extends number[] = []
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
  runtimeConfig: {
    app: {
      baseURL: string;
    };
    [key: string]: any;
  };
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
  experimental?: {
    wasm?: boolean | RollupWasmOptions;
    legacyExternals?: boolean;
  };
  serverAssets: ServerAssetDir[];
  publicAssets: PublicAssetDir[];

  imports: UnimportPluginOptions | false;
  plugins: string[];
  virtual: Record<string, string | (() => string | Promise<string>)>;
  compressPublicAssets: boolean | CompressOptions;

  // Dev
  dev: boolean;
  devServer: DevServerOptions;
  watchOptions: WatchOptions;
  devProxy: Record<string, string | HTTPProxyOptions>;

  // Routing
  baseURL: string;
  handlers: NitroEventHandler[];
  routeRules: { [path: string]: NitroRouteRules };
  devHandlers: NitroDevEventHandler[];
  errorHandler: string;
  devErrorHandler: NitroErrorHandler;
  prerender: {
    crawlLinks: boolean;
    ignore: string[];
    routes: string[];
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

  // Advanced
  typescript: {
    strict?: boolean;
    internalPaths?: boolean;
    generateTsConfig?: boolean;
    /** the path of the generated `tsconfig.json`, relative to buildDir */
    tsconfigPath: string;
  };
  hooks: NestedHooks<NitroHooks>;
  nodeModulesDirs: string[];
  commands: {
    preview: string;
    deploy: string;
  };
}
