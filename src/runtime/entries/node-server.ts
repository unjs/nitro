import "#internal/nitro/virtual/polyfill";
import { Server as HttpServer } from "node:http";
import type { AddressInfo } from "node:net";
import { Server as HttpsServer } from "node:https";
import destr from "destr";
import { toNodeListener } from "h3";
import { nitroApp } from "../app";
import { setupGracefulShutdown } from "../shutdown";
import { trapUnhandledNodeErrors } from "../utils";
import { useRuntimeConfig } from "#internal/nitro";

const cert = process.env.NITRO_SSL_CERT;
const key = process.env.NITRO_SSL_KEY;

const server =
  cert && key
    ? new HttpsServer({ key, cert }, toNodeListener(nitroApp.h3App))
    : new HttpServer(toNodeListener(nitroApp.h3App));

const port = (destr(process.env.NITRO_PORT || process.env.PORT) ||
  3000) as number;
const host = process.env.NITRO_HOST || process.env.HOST;

const path = process.env.NITRO_UNIX_SOCKET;

const requestTimeout = (destr(process.env.NITRO_NODE_REQUEST_TIMEOUT) || 300000) as number
const keepAliveTimeout = (destr(process.env.NITRO_NODE_KEEPALIVE_TIMEOUT) || 5000) as number
const headersTimeout = Math.min(destr(process.env.NITRO_NODE_HEADERS_TIMEOUT) || 60000, requestTimeout)

server.requestTimeout = requestTimeout
server.keepAliveTimeout = keepAliveTimeout
server.headersTimeout = headersTimeout

// @ts-ignore
const listener = server.listen(path ? { path } : { port, host }, (err) => {
  if (err) {
    console.error(err);
    // eslint-disable-next-line unicorn/no-process-exit
    process.exit(1);
  }
  const protocol = cert && key ? "https" : "http";
  const addressInfo = listener.address() as AddressInfo;
  if (typeof addressInfo === "string") {
    console.log(`Listening on unix socket ${addressInfo}`);
    return;
  }
  const baseURL = (useRuntimeConfig().app.baseURL || "").replace(/\/$/, "");
  const url = `${protocol}://${
    addressInfo.family === "IPv6"
      ? `[${addressInfo.address}]`
      : addressInfo.address
  }:${addressInfo.port}${baseURL}`;
  console.log(`Listening on ${url}`);
});

// Trap unhandled errors
trapUnhandledNodeErrors();

// Graceful shutdown
setupGracefulShutdown(listener, nitroApp);

export default {};
