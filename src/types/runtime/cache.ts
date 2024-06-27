import type { H3Event } from "h3";

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
  headers: Record<string, string>;
}

export interface CachedEventHandlerOptions<T = any>
  extends Omit<CacheOptions<ResponseCacheEntry<T>>, "transform" | "validate"> {
  shouldInvalidateCache?: (event: H3Event) => boolean | Promise<boolean>;
  shouldBypassCache?: (event: H3Event) => boolean | Promise<boolean>;
  getKey?: (event: H3Event) => string | Promise<string>;
  headersOnly?: boolean;
  varies?: string[] | readonly string[];
}
