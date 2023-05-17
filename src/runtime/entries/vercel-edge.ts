import "#internal/nitro/virtual/polyfill";
import { nitroApp } from "#internal/nitro/app";

export default async function handleEvent(request, event) {
  const url = new URL(request.url);

  let body;
  if (request.body) {
    body = await request.arrayBuffer();
  }

  const r = await nitroApp.localCall({
    event,
    url: url.pathname + url.search,
    host: url.hostname,
    protocol: url.protocol,
    headers: Object.fromEntries(request.headers.entries()),
    method: request.method,
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
