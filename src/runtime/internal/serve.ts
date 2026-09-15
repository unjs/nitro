import type { NitroApp } from "nitro/types";
import type { Server, ServerHandler, ServerOptions, ServerPlugin, ServerRequest } from "srvx";
import { serverEntryOptions } from "#nitro/virtual/server-entry";
import { tracingSrvxPlugins } from "#nitro/virtual/tracing";

/**
 * Resolve srvx `serve()` options for a server preset.
 *
 * Options exported from the server entry (`export default { fetch, ...options }`) are the base.
 * `NITRO_PORT`/`PORT`, `NITRO_HOST`/`HOST` and `NITRO_SSL_CERT`/`NITRO_SSL_KEY` take precedence
 * over them, and the preset's own options (`fetch` and runtime specific settings) win last.
 */
export function resolveServeOptions(opts: ServerOptions): ServerOptions {
  const { port, hostname, tls, plugins, ...entryOptions } = serverEntryOptions;

  const env: Record<string, string | undefined> = globalThis.process?.env || {};
  const _parsedPort = Number.parseInt(env.NITRO_PORT ?? env.PORT ?? "");
  const cert = env.NITRO_SSL_CERT;
  const key = env.NITRO_SSL_KEY;
  // const socketPath = env.NITRO_UNIX_SOCKET; // TODO

  const resolved: ServerOptions = {
    ...entryOptions,
    port: Number.isNaN(_parsedPort) ? (port ?? 3000) : _parsedPort,
    hostname: env.NITRO_HOST || env.HOST || hostname,
    tls: cert && key ? { cert, key } : tls,
    ...opts,
    plugins: [...tracingSrvxPlugins, ...(plugins || []), ...(opts.plugins || [])],
  };

  for (const runtime of ["node", "bun", "deno"] as const) {
    if (entryOptions[runtime] && opts[runtime]) {
      resolved[runtime] = { ...entryOptions[runtime], ...opts[runtime] } as any;
    }
  }

  return resolved;
}

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
