export type { NitroApp } from "./app";
export type {
  CacheEntry,
  CacheOptions,
  ResponseCacheEntry,
  CachedEventHandlerOptions,
} from "./cache";
export type { NitroAppPlugin, defineNitroPlugin } from "./plugin";
export type { RenderResponse, RenderHandler } from "./renderer";

declare module "h3" {
  interface H3Event {
    /** @experimental Calls fetch with same context and request headers */
    fetch: typeof globalThis.fetch;
    /** @experimental Calls fetch with same context and request headers */
    $fetch: typeof globalThis.fetch;
  }
}
