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

  return nitroApp.localFetchWithNormalizedHeaders(url.pathname + url.search, {
    host: url.hostname,
    protocol: url.protocol,
    headers: request.headers,
    method: request.method,
    redirect: request.redirect,
    body,
  });
}
