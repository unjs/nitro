import type { ServerOptions, ServerPlugin, ServerRequest } from "srvx";
import { serve as serveGeneric } from "srvx/generic";
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
 * Apply server entry `middleware`, `plugins` and `error` options to the fetch handler of a preset
 * that does not start a srvx server (serverless, edge and worker runtimes), using the srvx generic adapter.
 *
 * Listener options (`port`, `hostname`, `tls`, ...) and runtime specific options have no effect there.
 */
export function withServerEntryOptions<
  T extends (req: ServerRequest) => Response | Promise<Response>,
>(fetch: T): T {
  const { middleware, plugins, error } = serverEntryOptions;
  if (!middleware?.length && !plugins?.length && !error) {
    return fetch;
  }

  // The generic adapter overrides `request.waitUntil` with its own (never awaited) implementation.
  // Restore the one provided by the platform before server entry middleware runs.
  const platformWaitUntil = new WeakMap<Request, ServerRequest["waitUntil"]>();
  const restoreWaitUntil: ServerPlugin = (server) => {
    server.options.middleware.unshift((req, next) => {
      const waitUntil = platformWaitUntil.get(req);
      if (waitUntil) {
        Object.defineProperty(req, "waitUntil", {
          value: waitUntil,
          writable: true,
          configurable: true,
        });
      }
      return next();
    });
  };

  const server = serveGeneric({
    ...serverEntryOptions,
    fetch,
    plugins: [...(plugins || []), restoreWaitUntil],
  });

  return ((req: ServerRequest) => {
    if (req.waitUntil) {
      platformWaitUntil.set(req, req.waitUntil);
    }
    return server.fetch(req);
  }) as T;
}
