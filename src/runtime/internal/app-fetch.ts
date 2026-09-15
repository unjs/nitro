import type { NitroApp } from "nitro/types";
import type { Server, ServerHandler, ServerPlugin, ServerRequest } from "srvx";
import { serverEntryOptions } from "#nitro/virtual/server-entry";

/**
 * srvx plugin for presets starting a srvx server: points `nitroApp.fetch` to the server middleware
 * (including middleware added by plugins) around its fetch handler, so direct `nitroApp.fetch()` calls
 * get the same options without running plugins again.
 */
export function appFetchPlugin(nitroApp: NitroApp): ServerPlugin {
  return (server) => {
    let handler: ServerHandler | undefined;
    // Bun and Deno pass `error` to the native server, the Node.js adapter registers it as middleware.
    nitroApp.fetch = (req) => (handler ??= composeFetch(server, server.runtime !== "node"))(req);
  };
}

/**
 * Apply server entry `middleware`, `plugins` and `error` options to the Nitro app fetch handler.
 *
 * Plugins are called with a minimal server object (`runtime` and `options`) on first request.
 * Presets starting a srvx server replace it using {@link appFetchPlugin}.
 */
export function withServerEntryOptions<
  T extends (req: ServerRequest) => Response | Promise<Response>,
>(fetch: T): T {
  const { middleware, plugins, error } = serverEntryOptions;
  if (!middleware?.length && !plugins?.length && !error) {
    return fetch;
  }
  let handler: ServerHandler | undefined;
  return ((req: ServerRequest) => (handler ??= createGenericFetch(fetch))(req)) as T;
}

function createGenericFetch(fetch: ServerHandler): ServerHandler {
  const server = {
    runtime: "generic",
    options: {
      ...serverEntryOptions,
      fetch,
      middleware: [...(serverEntryOptions.middleware || [])],
    },
  } as unknown as Server;
  try {
    for (const plugin of serverEntryOptions.plugins || []) {
      plugin(server);
    }
  } catch (error) {
    return () => Promise.reject(error);
  }
  return composeFetch(server, true);
}

function composeFetch(server: Server, withError: boolean): ServerHandler {
  const { middleware, error } = server.options;
  let handler = server.options.fetch;
  for (let i = middleware.length - 1; i >= 0; i--) {
    const mw = middleware[i]!;
    const next = handler;
    handler = (req) => mw(req, () => next(req));
  }
  if (withError && error) {
    const next = handler;
    handler = async (req) => {
      try {
        return await next(req);
      } catch (error_) {
        return error(error_);
      }
    };
  }
  return handler;
}
