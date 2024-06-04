import "#nitro-internal-pollyfills";
import { useNitroApp } from "nitropack/runtime";
import { trapUnhandledNodeErrors } from "nitropack/runtime/internal/utils";
import { runTask } from "nitropack/runtime/internal/task";
import { startScheduleRunner } from "nitropack/runtime/internal/task";
import { tasks, scheduledTasks } from "#nitro-internal-virtual/tasks";

import { Server } from "node:http";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { mkdirSync } from "node:fs";
import { threadId, parentPort } from "node:worker_threads";
import { isWindows, provider } from "std-env";
import {
  defineEventHandler,
  getQuery,
  getRouterParam,
  toNodeListener,
  readBody,
} from "h3";
import wsAdapter from "crossws/adapters/node";

const nitroApp = useNitroApp();

const server = new Server(toNodeListener(nitroApp.h3App));

if (import.meta._websocket) {
  const { handleUpgrade } = wsAdapter(nitroApp.h3App.websocket);
  server.on("upgrade", handleUpgrade);
}

function getAddress() {
  if (
    provider === "stackblitz" ||
    process.env.NITRO_NO_UNIX_SOCKET ||
    process.versions.bun
  ) {
    return 0;
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
  parentPort?.postMessage({
    event: "listen",
    address:
      typeof _address === "string"
        ? { socketPath: _address }
        : { host: "localhost", port: _address?.port },
  });
});

// Register tasks handlers
nitroApp.router.get(
  "/_nitro/tasks",
  defineEventHandler(async (event) => {
    const _tasks = await Promise.all(
      Object.entries(tasks).map(async ([name, task]) => {
        const _task = await task.resolve?.();
        return [name, { description: _task?.meta?.description }];
      })
    );
    return {
      tasks: Object.fromEntries(_tasks),
      scheduledTasks,
    };
  })
);
nitroApp.router.use(
  "/_nitro/tasks/:name",
  defineEventHandler(async (event) => {
    const name = getRouterParam(event, "name") as string;
    const payload = {
      ...getQuery(event),
      ...(await readBody(event)
        .then((r) => r?.payload)
        .catch(() => ({}))),
    };
    return await runTask(name, { payload });
  })
);

// Trap unhandled errors
trapUnhandledNodeErrors();

// Graceful shutdown
async function onShutdown(signal?: NodeJS.Signals) {
  await nitroApp.hooks.callHook("close");
}
parentPort?.on("message", async (msg) => {
  if (msg && msg.event === "shutdown") {
    await onShutdown();
    parentPort?.postMessage({ event: "exit" });
  }
});

// Scheduled tasks
if (import.meta._tasks) {
  startScheduleRunner();
}
