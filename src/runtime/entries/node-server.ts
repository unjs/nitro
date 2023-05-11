import "#internal/nitro/virtual/polyfill";
import { Server as HttpServer } from "node:http";
import type { AddressInfo } from "node:net";
import { Server as HttpsServer } from "node:https";
import destr from "destr";
import { toNodeListener } from "h3";
import gracefulShutdown from "http-graceful-shutdown";
import { nitroApp } from "../app";
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

// @ts-ignore
const listener = server.listen(port, host, (err) => {
  if (err) {
    console.error(err);
    // eslint-disable-next-line unicorn/no-process-exit
    process.exit(1);
  }
  const protocol = cert && key ? "https" : "http";
  const addressInfo = listener.address() as AddressInfo;
  const baseURL = (useRuntimeConfig().app.baseURL || "").replace(/\/$/, "");
  const url = `${protocol}://${
    addressInfo.family === "IPv6"
      ? `[${addressInfo.address}]`
      : addressInfo.address
  }:${addressInfo.port}${baseURL}`;
  console.log(`Listening ${url}`);
});

if (process.env.DEBUG) {
  process.on("unhandledRejection", (err) =>
    console.error("[nitro] [dev] [unhandledRejection]", err)
  );
  process.on("uncaughtException", (err) =>
    console.error("[nitro] [dev] [uncaughtException]", err)
  );
} else {
  process.on("unhandledRejection", (err) =>
    console.error("[nitro] [dev] [unhandledRejection] " + err)
  );
  process.on("uncaughtException", (err) =>
    console.error("[nitro] [dev] [uncaughtException] " + err)
  );
}

// graceful shutdown
if (process.env.NITRO_SHUTDOWN === "true") {
  // https://www.gnu.org/software/libc/manual/html_node/Termination-Signals.html
  const terminationSignals: NodeJS.Signals[] = ["SIGTERM", "SIGINT"];
  const signals =
    process.env.NITRO_SHUTDOWN_SIGNALS || terminationSignals.join(" ");
  const timeout =
    Number.parseInt(process.env.NITRO_SHUTDOWN_TIMEOUT, 10) || 30 * 1000;
  const forceExit = process.env.NITRO_SHUTDOWN_FORCE !== "false";

  async function onShutdown(signal?: NodeJS.Signals) {
    await nitroApp.hooks.callHook("close");
  }

  // https://github.com/sebhildebrandt/http-graceful-shutdown
  gracefulShutdown(listener, { signals, timeout, forceExit, onShutdown });
}

export default {};
