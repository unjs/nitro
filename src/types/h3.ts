import type { NitroFetchRequest, $Fetch } from "./fetch";
import type { CaptureError, CapturedErrorContext } from "./error";

export type H3EventFetch = (
  request: NitroFetchRequest,
  init?: RequestInit
) => Promise<Response>;

export type H3Event$Fetch = $Fetch<unknown, NitroFetchRequest>;

declare module "h3" {
  interface H3Event {
    /** @experimental Calls fetch with same context and request headers */
    fetch: H3EventFetch;
    /** @experimental Calls fetch with same context and request headers */
    $fetch: H3Event$Fetch;
    /** @experimental See https://github.com/unjs/nitro/issues/1420 */
    waitUntil: (promise: Promise<unknown>) => void;
    /** @experimental */
    captureError: CaptureError;
  }
  interface H3Context {
    nitro: {
      _waitUntilPromises?: Promise<unknown>[];
      /** @experimental */
      errors: { error?: Error; context: CapturedErrorContext }[];
    };
  }
}

export {};
