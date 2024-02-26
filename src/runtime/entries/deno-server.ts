import "#internal/nitro/virtual/polyfill";
import destr from "destr";
import wsAdapter from "crossws/adapters/deno";
import { nitroApp } from "../app";
import { useRuntimeConfig } from "#internal/nitro";

if (Deno.env.get("DEBUG")) {
  addEventListener("unhandledrejection", (event: any) =>
    console.error("[nitro] [dev] [unhandledRejection]", event.reason)
  );
  addEventListener("error", (event: any) =>
    console.error("[nitro] [dev] [uncaughtException]", event.error)
  );
} else {
  addEventListener("unhandledrejection", (err: any) =>
    console.error("[nitro] [production] [unhandledRejection] " + err)
  );
  addEventListener("error", (event: any) =>
    console.error("[nitro] [production] [uncaughtException] " + event.error)
  );
}

// https://deno.land/api@v1.34.3?s=Deno.serve&unstable=
Deno.serve(
  {
    key: Deno.env.get("NITRO_SSL_KEY"),
    cert: Deno.env.get("NITRO_SSL_CERT"),
    port: destr(Deno.env.get("NITRO_PORT") || Deno.env.get("PORT")) || 3000,
    hostname: Deno.env.get("NITRO_HOST") || Deno.env.get("HOST"),
    onListen: (opts) => {
      const baseURL = (useRuntimeConfig().app.baseURL || "").replace(/\/$/, "");
      const url = `${opts.hostname}:${opts.port}${baseURL}`;
      console.log(`Listening ${url}`);
    },
  },
  handler
);

// Websocket support
const ws = import.meta._websocket
  ? wsAdapter(nitroApp.h3App.websocket)
  : undefined;

async function handler(request: Request, info: any) {
  if (
    import.meta._websocket &&
    request.headers.get("upgrade") === "websocket"
  ) {
    return ws.handleUpgrade(request, info);
  }

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

export default {};
