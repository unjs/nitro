import "#nitro-internal-pollyfills";
import { useNitroApp } from "nitro/runtime";
import { startScheduleRunner } from "nitro/runtime/internal";

import type {} from "bun";
import wsAdapter from "crossws/adapters/bun";

const nitroApp = useNitroApp();

const ws = import.meta._websocket
  ? wsAdapter(nitroApp.h3App.websocket)
  : undefined;

const server = Bun.serve({
  port: process.env.NITRO_PORT || process.env.PORT || 3000,
  websocket: import.meta._websocket ? ws!.websocket : (undefined as any),
  async fetch(req, server) {
    if (import.meta._websocket && (await ws!.handleUpgrade(req, server))) {
      return;
    }

    const url = new URL(req.url);

    let body;
    if (req.body) {
      body = await req.arrayBuffer();
    }

    return nitroApp.localFetch(url.pathname + url.search, {
      host: url.hostname,
      protocol: url.protocol,
      headers: req.headers,
      method: req.method,
      redirect: req.redirect,
      body,
    });
  },
});

console.log(`Listening on http://localhost:${server.port}...`);

// Scheduled tasks
if (import.meta._tasks) {
  startScheduleRunner();
}
