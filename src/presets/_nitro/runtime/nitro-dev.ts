import "#nitro/virtual/polyfills";

import { useNitroApp, useNitroHooks } from "nitro/app";
import { startScheduleRunner } from "#nitro/runtime/task";
import { trapUnhandledErrors } from "#nitro/runtime/error/hooks";
import { resolveWebsocketHooks } from "#nitro/runtime/app";
import { tracingSrvxPlugins } from "#nitro/virtual/tracing";

import type { AppEntry } from "env-runner";

const nitroApp = useNitroApp();
const nitroHooks = useNitroHooks();

trapUnhandledErrors();

// Scheduled tasks
if (import.meta._tasks) {
  startScheduleRunner({});
}

const ws = import.meta._websocket
  ? await import("crossws/adapters/node").then((m) =>
      (m.default || m)({ resolve: resolveWebsocketHooks })
    )
  : undefined;

export default {
  fetch(request) {
    // Bindings lookup of unstorage and db0 cloudflare drivers
    if (request.runtime?.name === "cloudflare") {
      (globalThis as any).__env__ = request.runtime.cloudflare?.env;
    }
    return nitroApp.fetch(request);
  },
  plugins: [...tracingSrvxPlugins],
  upgrade: ws
    ? (context: { node: { req: any; socket: any; head: any } }) => {
        ws.handleUpgrade(context.node.req, context.node.socket, context.node.head);
      }
    : undefined,
  ipc: {
    onClose: () => nitroHooks.callHook("close"),
  },
} satisfies AppEntry;
