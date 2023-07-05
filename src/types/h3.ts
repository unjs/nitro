import type { NitroFetchRequest, $Fetch } from "./fetch";

export type H3EventFetch = (
  request: NitroFetchRequest,
  init?: RequestInit,
) => Promise<Response>;

export type H3Event$Fetch = $Fetch<unknown, NitroFetchRequest>;

declare module "h3" {
  interface H3Event {
    /** @experimental Calls fetch with same context and request headers */
    fetch: H3EventFetch;
    /** @experimental Calls fetch with same context and request headers */
    $fetch: H3Event$Fetch;
  }
}

export {};
