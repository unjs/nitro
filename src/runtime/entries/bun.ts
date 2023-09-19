import "#internal/nitro/virtual/polyfill";
import { nitroApp } from "../app";

const options: any = {};
let listeningOn = "";

if (process.env.NITRO_UNIX_SOCKET) {
  options.unix = process.env.NITRO_UNIX_SOCKET;
  listeningOn = `unix://${process.env.NITRO_UNIX_SOCKET}`;
} else {
  options.port = process.env.NITRO_PORT || process.env.PORT || 3000;
  listeningOn = `http://localhost:${options.port}`;
}

// @ts-expect-error: Bun global
const server = Bun.serve({
  ...options,
  async fetch(request: Request) {
    const url = new URL(request.url);

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
  },
});

console.log(`Listening on ${listeningOn}...`);
