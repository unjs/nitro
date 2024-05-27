import type { H3Event, AppOptions, App as H3App, Router } from "h3";
import type { Hookable } from "hookable";
import type {
  createCall,
  createFetch as createLocalFetch,
} from "unenv/runtime/fetch/index";

export interface NitroApp {
  h3App: H3App;
  router: Router;
  hooks: Hookable<NitroRuntimeHooks>;
  localCall: ReturnType<typeof createCall>;
  localFetch: ReturnType<typeof createLocalFetch>;
  captureError: CaptureError;
}

export interface NitroAppPlugin {
  (nitro: NitroApp): void;
}

export interface RenderResponse {
  body: any;
  statusCode: number;
  statusMessage: string;
  headers: Record<string, string>;
}

export type RenderHandler = (
  event: H3Event
) => Partial<RenderResponse> | Promise<Partial<RenderResponse>>;

export interface CapturedErrorContext {
  event?: H3Event;
  [key: string]: unknown;
}

export type CaptureError = (
  error: Error,
  context: CapturedErrorContext
) => void;

export interface NitroRuntimeHooks {
  close: () => void;
  error: CaptureError;

  request: NonNullable<AppOptions["onRequest"]>;
  beforeResponse: NonNullable<AppOptions["onBeforeResponse"]>;
  afterResponse: NonNullable<AppOptions["onAfterResponse"]>;

  "render:response": (
    response: Partial<RenderResponse>,
    context: { event: H3Event }
  ) => void;
}

export interface CacheEntry<T = any> {
  value?: T;
  expires?: number;
  mtime?: number;
  integrity?: string;
}

export interface CacheOptions<T = any> {
  name?: string;
  getKey?: (...args: any[]) => string | Promise<string>;
  transform?: (entry: CacheEntry<T>, ...args: any[]) => any;
  validate?: (entry: CacheEntry<T>) => boolean;
  shouldInvalidateCache?: (...args: any[]) => boolean | Promise<boolean>;
  shouldBypassCache?: (...args: any[]) => boolean | Promise<boolean>;
  group?: string;
  integrity?: any;
  /**
   * Number of seconds to cache the response. Defaults to 1.
   */
  maxAge?: number;
  swr?: boolean;
  staleMaxAge?: number;
  base?: string;
}

export interface ResponseCacheEntry<T = any> {
  body: T | undefined;
  code: number;
  headers: Record<string, string | number | string[] | undefined>;
}

export interface CachedEventHandlerOptions<T = any>
  extends Omit<CacheOptions<ResponseCacheEntry<T>>, "transform" | "validate"> {
  shouldInvalidateCache?: (event: H3Event) => boolean | Promise<boolean>;
  shouldBypassCache?: (event: H3Event) => boolean | Promise<boolean>;
  getKey?: (event: H3Event) => string | Promise<string>;
  headersOnly?: boolean;
  varies?: string[] | readonly string[];
}
