import "#internal/nitro/virtual/polyfill";
// @ts-ignore
import { nitroApp } from "../app";

// https://deno.land/api?s=Deno.ServeHandlerInfo
type ServeHandlerInfo = {
  remoteAddr: {
    transport: "tcp" | "udp";
    hostname: string;
    port: number;
  };
};

// @ts-expect-error unknown global Deno
Deno.serve((request, info) => {
  return handleRequest(request, info);
});

async function handleRequest(request: Request, info: ServeHandlerInfo) {
  const url = new URL(request.url);

  const headers = new Headers(request.headers);
  if (!headers.has("x-forwarded-for") && info?.remoteAddr?.hostname) {
    headers.set("x-forwarded-for", info.remoteAddr.hostname);
  }
  if (!headers.has("x-forwarded-proto")) {
    // There is currently no way to know if the request was made over HTTP or HTTPS
    // Deno deploy force redirects to HTTPS so we assume HTTPS by default
    headers.set("x-forwarded-proto", "https");
  }

  // https://deno.land/api?s=Body
  let body;
  if (request.body) {
    body = await request.arrayBuffer();
  }

  return nitroApp.localFetch(url.pathname + url.search, {
    host: url.hostname,
    protocol: url.protocol,
    headers,
    method: request.method,
    redirect: request.redirect,
    body,
  });
}
