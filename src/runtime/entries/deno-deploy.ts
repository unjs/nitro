import "#internal/nitro/virtual/polyfill";
// @ts-ignore
import { nitroApp } from "../app";

// @ts-expect-error unknown global Deno
Deno.serve((request,info) => {
  return handleRequest(request,info);
});

async function handleRequest(request: Request,info) {
  const url = new URL(request.url);
  const headers = new Headers(request.headers);
  headers.set("x-forwarded-for", info.remoteAddr.hostname);//add x-forwarded-for header.

  // https://deno.land/api?s=Body
  let body;
  if (request.body) {
    body = await request.arrayBuffer();
  }

  return nitroApp.localFetch(url.pathname + url.search, {
    host: url.hostname,
    protocol: url.protocol,
    headers: request.headers,
    method: request.method,
    redirect: request.redirect,
    body,
  });
}
