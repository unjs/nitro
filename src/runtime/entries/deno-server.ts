import destr from "destr";

import { handler } from "./deno";
import { useRuntimeConfig } from "#internal/nitro";

// @ts-expect-error unknown global Deno
const cert = Deno.env.get("NITRO_SSL_CERT");
// @ts-expect-error unknown global Deno
const key = Deno.env.get("NITRO_SSL_KEY");
// @ts-expect-error unknown global Deno
const port = destr(Deno.env.get("NITRO_PORT") || Deno.env.get("PORT")) || 3e3;
// @ts-expect-error unknown global Deno
const hostname = Deno.env.get("NITRO_HOST") || Deno.env.get("HOST");

function onListen(opts) {
  const baseURL = (useRuntimeConfig().app.baseURL || "").replace(/\/$/, "");
  const url = `${opts.hostname}:${opts.port}${baseURL}`;
  console.log(`Listening ${url}`);
}

// @ts-expect-error unknown global Deno
if (Deno.env.get("DEBUG")) {
  addEventListener("unhandledrejection", (event) =>
    console.error("[nitro] [dev] [unhandledRejection]", event.reason)
  );
  addEventListener("error", (event) =>
    console.error("[nitro] [dev] [uncaughtException]", event.error)
  );
} else {
  addEventListener("unhandledrejection", (err) =>
    console.error("[nitro] [production] [unhandledRejection] " + err)
  );
  addEventListener("error", (event) =>
    console.error("[nitro] [production] [uncaughtException] " + event.error)
  );
}

// @ts-expect-error unknown global Deno
Deno.serve(handler, { key, cert, port, hostname, onListen });

export default {};
