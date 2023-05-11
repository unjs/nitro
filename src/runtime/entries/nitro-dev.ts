import "#internal/nitro/virtual/polyfill";
import { Server } from "node:http";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { mkdirSync } from "node:fs";
import { threadId, parentPort } from "node:worker_threads";
import { isWindows, provider } from "std-env";
import { toNodeListener } from "h3";
import gracefulShutdown from "http-graceful-shutdown";
import { nitroApp } from "../app";

const server = new Server(toNodeListener(nitroApp.h3App));

function getAddress() {
  if (provider === "stackblitz" || process.env.NITRO_NO_UNIX_SOCKET) {
    return "0";
  }
  const socketName = `worker-${process.pid}-${threadId}.sock`;
  if (isWindows) {
    return join("\\\\.\\pipe\\nitro", socketName);
  } else {
    const socketDir = join(tmpdir(), "nitro");
    mkdirSync(socketDir, { recursive: true });
    return join(socketDir, socketName);
  }
}

const listenAddress = getAddress();
const listener = server.listen(listenAddress, () => {
  const _address = server.address();
  parentPort.postMessage({
    event: "listen",
    address:
      typeof _address === "string"
        ? { socketPath: _address }
        : { host: "localhost", port: _address.port },
  });
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
if (process.env.NITRO_SHUTDOWN_DISABLE === "false") {
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
