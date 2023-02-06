import "#internal/nitro/virtual/polyfill";
import { nitroApp } from "../app";
import { requestHasBody, useRequestBody } from "../utils";

export async function handler(request: Request) {
  const url = new URL(request.url);
  let body;
  if (requestHasBody(request)) {
    body = await useRequestBody(request);
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

  // TODO: fix in runtime/static
  const responseBody = r.status !== 304 ? r.body : null;
  return new Response(responseBody, {
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
