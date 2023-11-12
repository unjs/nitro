import "#internal/nitro/virtual/polyfill";
// @ts-ignore
import { nitroApp } from "../app";

// @ts-expect-error unknown global Deno
Deno.serve((request: Request) => {
  return handleRequest(request);
});

async function handleRequest(request: Request) {
  const url = new URL(request.url);

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
