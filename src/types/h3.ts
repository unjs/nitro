import type { NitroFetchRequest, $Fetch } from "./fetch";

declare module "h3" {
  interface H3Event {
    /** @experimental Calls fetch with same context and request headers */
    fetch: (
      request: NitroFetchRequest,
      init?: RequestInit
    ) => Promise<Response>;
    /** @experimental Calls fetch with same context and request headers */
    $fetch: $Fetch<unknown, NitroFetchRequest>;
  }
}

export {};
