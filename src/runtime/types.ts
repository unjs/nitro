import {
  ScheduledEvent,
  ExecutionContext,
  MessageBatch,
  QueueEvent,
  ScheduledController,
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

type SendResponse = { sendResponse: () => any };

export type ExtendedExecutionContext = ExecutionContext & SendResponse;

interface CloudflareModuleRuntimeHooks {
  "cloudflare:scheduled": (e: {
    controller: ScheduledController;
    env: CloudflareModuleEnv;
    context: ExtendedExecutionContext;
  }) => any;
  "cloudflare:queue": (e: {
    batch: MessageBatch;
    env: CloudflareModuleEnv;
    context: ExtendedExecutionContext;
  }) => any;
}

interface CloudflareSWRuntimeHooks {
  "cloudflare:scheduled": (event: ScheduledEvent) => any;
  "cloudflare:queue": (event: QueueEvent) => any;
}

export interface NitroRuntimeHooks {
  close: () => void;
  error: CaptureError;

  request: AppOptions["onRequest"];
  beforeResponse: AppOptions["onBeforeResponse"];
  afterResponse: AppOptions["onAfterResponse"];

  "cloudflare-module:scheduled": CloudflareModuleRuntimeHooks["cloudflare:scheduled"];
  "cloudflare-module:queue": CloudflareModuleRuntimeHooks["cloudflare:queue"];

  "cloudflare:scheduled": CloudflareSWRuntimeHooks["cloudflare:scheduled"];
  "cloudflare:queue": CloudflareSWRuntimeHooks["cloudflare:queue"];

  "render:response": (
    response: Partial<RenderResponse>,
    context: { event: H3Event }
  ) => void;
}
