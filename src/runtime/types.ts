import {
  ScheduledEvent,
  ExecutionContext,
  MessageBatch,
  QueueEvent,
} from "@cloudflare/workers-types";
import type { H3Event, AppOptions } from "h3";
import type { RenderResponse } from "./renderer";

export type { NitroApp } from "./app";
export type {
  CacheEntry,
  CacheOptions,
  ResponseCacheEntry,
  CachedEventHandlerOptions,
} from "./cache";
export type { NitroAppPlugin } from "./plugin";
export type { RenderResponse, RenderHandler } from "./renderer";

export type CapturedErrorContext = {
  event?: H3Event;
  [key: string]: unknown;
};

export type CaptureError = (
  error: Error,
  context: CapturedErrorContext
) => void;

interface CloudflareModuleEnv {
  [key: string]: any;
}

interface CloudflareModuleRuntimeHooks {
  "cloudflare:scheduled": (
    event: ScheduledEvent,
    env: CloudflareModuleEnv,
    context: ExecutionContext
  ) => any;
  "cloudflare:queue": (
    event: MessageBatch,
    env: CloudflareModuleEnv,
    context: ExecutionContext
  ) => any;
}

interface CloudflareSWRuntimeHooks {
  "cloudflare:scheduled": (event: ScheduledEvent) => any;
  "cloudflare:queue": (event: QueueEvent) => any;
}

type CloudflareRuntimeOptions =
  | CloudflareModuleRuntimeHooks
  | CloudflareSWRuntimeHooks;

export interface NitroRuntimeHooks {
  close: () => void;
  error: CaptureError;

  request: AppOptions["onRequest"];
  beforeResponse: AppOptions["onBeforeResponse"];
  afterResponse: AppOptions["onAfterResponse"];

  "cloudflare:scheduled": CloudflareRuntimeOptions["cloudflare:scheduled"];
  "cloudflare:queue": CloudflareRuntimeOptions["cloudflare:queue"];

  "render:response": (
    response: Partial<RenderResponse>,
    context: { event: H3Event }
  ) => void;
}
