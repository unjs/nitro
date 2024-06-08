import type { H3Event, AppOptions, App as H3App, Router } from "h3";
import type { Hookable } from "hookable";
import type {
  createCall,
  createFetch as createLocalFetch,
} from "unenv/runtime/fetch/index";
import { EmailContext, MessageBatch } from "#internal/nitro/cloudflare";
import { ExecutionContext } from "@cloudflare/workers-types";

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

export interface NitroAsyncContext {
  event: H3Event;
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

  "cloudflare:email": (
    event: EmailContext,
    context: { env: any; context: ExecutionContext }
  ) => void;
  "cloudflare:queue": (
    event: MessageBatch,
    context: { env: any; context: ExecutionContext }
  ) => void;
}
