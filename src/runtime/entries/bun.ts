import "#internal/nitro/virtual/polyfill";
import type {} from "bun";
import wsAdapter from "crossws/adapters/bun";
import { nitroApp } from "../app";

const { handleUpgrade, websocket } = import.meta._websocket
  ? wsAdapter(nitroApp.h3App.websocket)
  : undefined;

const server = Bun.serve({
  port: process.env.NITRO_PORT || process.env.PORT || 3000,
  websocket,
  async fetch(req, server) {
    if (handleUpgrade && (await handleUpgrade(req, server))) {
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
