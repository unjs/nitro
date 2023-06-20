import "#internal/nitro/virtual/polyfill";
// @ts-ignore
import { serve } from "https://deno.land/std/http/server.ts";
import { nitroApp } from "../app";

serve((request: Request) => {
  return handleRequest(request);
});

async function handleRequest(request: Request) {
  const url = new URL(request.url);

  // https://deno.land/api?s=Body
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

  return new Response(r.body || undefined, {
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
