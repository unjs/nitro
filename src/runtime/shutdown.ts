import type { Server as HttpServer } from "node:http";
import gracefulShutdown from "http-graceful-shutdown";
import type { NitroApp } from "./types";

export function getGracefulShutdownConfig() {
  return {
    disabled: !!process.env.NITRO_SHUTDOWN_DISABLED,
    signals: (process.env.NITRO_SHUTDOWN_SIGNALS || "SIGTERM SIGINT").split(
      " "
    ),
    timeout: Number.parseInt(process.env.NITRO_SHUTDOWN_TIMEOUT, 10) || 30_000,
    forceExit: !process.env.NITRO_SHUTDOWN_NO_FORCE_EXIT,
  };
}

export function setupGracefulShutdown(
  listener: HttpServer,
  nitroApp: NitroApp
) {
  const shutdownConfig = getGracefulShutdownConfig();
  if (shutdownConfig.disabled) {
    return;
  }
  // https://github.com/sebhildebrandt/http-graceful-shutdown
  gracefulShutdown(listener, {
    signals: shutdownConfig.signals.join(" "),
    timeout: shutdownConfig.timeout,
    forceExit: shutdownConfig.forceExit,
    onShutdown: async () => {
      await nitroApp.hooks.callHook("close");
    },
  });
}
