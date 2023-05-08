import "#internal/nitro/virtual/polyfill";
import { requestHasBody, useRequestBody } from "../utils";
import { nitroApp } from "../app";

// @ts-expect-error: Bun global
const server = Bun.serve({
  port: process.env.NITRO_PORT || process.env.PORT || 3000,
  async fetch(request: Request) {
    const url = new URL(request.url);

    let body;
    if (requestHasBody(request)) {
      body = await useRequestBody(request);
    }

    const r = await nitroApp.localFetch(url.pathname + url.search, {
      ...request,
      host: url.hostname,
      protocol: url.protocol,
      body,
    });

    return r;
  },
});

console.log(`Listening on http://localhost:${server.port}...`);
