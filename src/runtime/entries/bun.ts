import "#internal/nitro/virtual/polyfill";
import { nitroApp } from "../app";
import fs from "fs";

const options: any = {};
let listeningOn = "";

if (process.env.NITRO_UNIX_SOCKET) {
  options.unix = process.env.NITRO_UNIX_SOCKET;
  listeningOn = `unix://${process.env.NITRO_UNIX_SOCKET}`;
} else {
  options.port = process.env.NITRO_PORT || process.env.PORT || 3000;
  listeningOn = `http://localhost:${options.port}`
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

// Set socket permission if provided. The permission must be provided in Octal format. e.g. 0o770
if (process.env.NITRO_UNIX_SOCKET && process.env.NITRO_UNIX_SOCKET_PERMISSION) {
  let chmodStatus = false;
  while (chmodStatus === false) {
    try {
      fs.chmodSync(process.env.NITRO_UNIX_SOCKET, process.env.NITRO_UNIX_SOCKET_PERMISSION);
      chmodStatus = true;
    } catch (e) {
      console.log("chmod error", e);
      console.log("retrying setting socket permission...");
    }
  }
}


console.log(`Listening on ${listeningOn}...`);
