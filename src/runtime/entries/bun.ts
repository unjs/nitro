import "#internal/nitro/virtual/polyfill";
import { nitroApp } from "../app";

// @ts-expect-error: Bun global
const server = Bun.serve({
  port: process.env.NITRO_PORT || process.env.PORT || 3000,
  async fetch(request: Request) {
    const url = new URL(request.url);

    let body;
    if (request.body) {
      body = await request.arrayBuffer();
    }

    const response = await nitroApp.localFetch(url.pathname + url.search, {
      url: url.pathname + url.search,
      host: url.hostname,
      protocol: url.protocol,
      headers: request.headers,
      method: request.method,
      redirect: request.redirect,
      body,
    });

    return response;
  },
});

console.log(`Listening on http://localhost:${server.port}...`);
