import type { H3Event } from "h3";

import type { RenderResponse } from "../types";
export type { NitroApp } from "./app";
export type {
  CacheEntry,
  CacheOptions,
  ResponseCacheEntry,
  CachedEventHandlerOptions,
} from "./cache";
export type { NitroAppPlugin } from "./plugin";
export type { RenderResponse, RenderHandler } from "./renderer";

declare module "h3" {
  interface H3Event {
    /** @experimental Calls fetch with same context and request headers */
    fetch: typeof globalThis.fetch;
    /** @experimental Calls fetch with same context and request headers */
    $fetch: typeof globalThis.fetch;
  }
}

export interface NitroRuntimeHooks {
  "render:response": (
    response: Partial<RenderResponse>,
    context: { event: H3Event }
  ) => void;
  close: () => void;
}
