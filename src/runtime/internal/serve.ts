import type { Server, ServerHandler, ServerOptions, ServerRequest } from "srvx";
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
 * Apply server entry `middleware`, `plugins` and `error` options to the Nitro app fetch handler.
 *
 * Plugins are called with a minimal server object (`runtime` and `options`) on first request.
 * Presets starting a srvx server use the raw handler (`nitroApp["~fetch"]`) and pass options to srvx instead.
 */
export function withServerEntryOptions<
  T extends (req: ServerRequest) => Response | Promise<Response>,
>(fetch: T): T {
  const { middleware, plugins, error } = serverEntryOptions;
  if (!middleware?.length && !plugins?.length && !error) {
    return fetch;
  }
  let handler: ServerHandler | undefined;
  return ((req: ServerRequest) => (handler ??= composeHandler(fetch))(req)) as T;
}

function composeHandler(fetch: ServerHandler): ServerHandler {
  const { middleware, plugins, error } = serverEntryOptions;

  const server = {
    runtime: "generic",
    options: { ...serverEntryOptions, fetch, middleware: [...(middleware || [])] },
  } as unknown as Server;

  for (const plugin of plugins || []) {
    plugin(server);
  }

  if (error) {
    server.options.middleware.unshift(async (_req, next) => {
      try {
        return await next();
      } catch (error_) {
        return error(error_);
      }
    });
  }

  let handler = server.options.fetch;
  for (let i = server.options.middleware.length - 1; i >= 0; i--) {
    const mw = server.options.middleware[i]!;
    const next = handler;
    handler = (req) => mw(req, () => next(req));
  }
  return handler;
}
