import "#internal/nitro/virtual/polyfill";
import { nitroApp } from "#internal/nitro/app";

export async function handler(request: Request): Promise<Response> {
  const url = new URL(request.url);

  let body;
  if (request.body) {
    body = await request.arrayBuffer();
  }

  const r = await nitroApp.localCall({
    url: url.pathname + url.search,
    host: url.hostname,
    protocol: url.protocol,
    headers: Object.fromEntries(request.headers.entries()),
    method: request.method,
    redirect: request.redirect,
    body,
  });

  return new Response(r.body, {
    // @ts-ignore TODO: Should be HeadersInit instead of string[][]
    headers: normalizeOutgoingHeaders(r.headers),
    status: r.status,
    statusText: r.statusText,
  });
}

function normalizeOutgoingHeaders(
  headers: Record<string, string | string[] | undefined>
) {
  return Object.entries(headers).map(([k, v]) => [
    k,
    Array.isArray(v) ? v.join(",") : v,
  ]);
}
