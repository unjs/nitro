import type { ServerOptions } from "srvx";
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

  const _parsedPort = Number.parseInt(process.env.NITRO_PORT ?? process.env.PORT ?? "");
  const cert = process.env.NITRO_SSL_CERT;
  const key = process.env.NITRO_SSL_KEY;
  // const socketPath = process.env.NITRO_UNIX_SOCKET; // TODO

  const resolved: ServerOptions = {
    ...entryOptions,
    port: Number.isNaN(_parsedPort) ? (port ?? 3000) : _parsedPort,
    hostname: process.env.NITRO_HOST || process.env.HOST || hostname,
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
