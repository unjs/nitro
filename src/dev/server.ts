import { Worker } from "node:worker_threads";
import { existsSync, accessSync, promises as fsp } from "node:fs";
import { writeFile } from "node:fs/promises";
import { TLSSocket } from "node:tls";
import { debounce } from "perfect-debounce";
import {
  App,
  createApp,
  eventHandler,
  fromNodeMiddleware,
  H3Error,
  H3Event,
  toNodeListener,
} from "h3";
import { createProxyServer, ProxyServerOptions } from "httpxy";
import { listen, Listener, ListenOptions } from "listhen";
import { servePlaceholder } from "serve-placeholder";
import serveStatic from "serve-static";
import { resolve } from "pathe";
import { joinURL } from "ufo";
import { FSWatcher, watch } from "chokidar";
import type { Nitro, NitroBuildInfo } from "../types";
import { version as nitroVersion } from "../../package.json";
import { createVFSHandler } from "./vfs";
import defaultErrorHandler from "./error";

export interface NitroWorker {
  worker: Worker;
  address: { host: string; port: number; socketPath?: string };
}

export interface NitroDevServer {
  reload: () => void;
  listen: (
    port: ListenOptions["port"],
    opts?: Partial<ListenOptions>
  ) => Promise<Listener>;
  app: App;
  close: () => Promise<void>;
  watcher?: FSWatcher;
}

function initWorker(filename: string): Promise<NitroWorker> | null {
  if (!existsSync(filename)) {
    return null;
  }
  return new Promise((resolve, reject) => {
    const worker = new Worker(filename);
    worker.once("exit", (code) => {
      reject(
        new Error(
          code ? "[worker] exited with code: " + code : "[worker] exited"
        )
      );
    });
    worker.once("error", (err) => {
      const newErr = new Error("[worker init] " + err.message);
      newErr.stack = err.stack;
      reject(newErr);
    });
    const addressListener = (event) => {
      if (!event || !event.address) {
        return;
      }
      worker.off("message", addressListener);
      resolve({
        worker,
        address: event.address,
      } as NitroWorker);
    };
    worker.on("message", addressListener);
  });
}

async function killWorker(worker: NitroWorker, nitro: Nitro) {
  if (!worker) {
    return;
  }
  if (worker.worker) {
    worker.worker.postMessage({ event: "shutdown" });
    const gracefulShutdownTimeout =
      Number.parseInt(process.env.NITRO_SHUTDOWN_TIMEOUT, 10) || 3;
    await new Promise<void>((resolve) => {
      const timeout = setTimeout(() => {
        nitro.logger.warn(
          `[nitro] [dev] Force closing worker after ${gracefulShutdownTimeout} seconds...`
        );
        resolve();
      }, gracefulShutdownTimeout * 1000);
      worker.worker.once("message", (message) => {
        if (message.event === "exit") {
          clearTimeout(timeout);
          resolve();
        }
      });
    });
    worker.worker.removeAllListeners();
    await worker.worker.terminate();
    worker.worker = null;
  }
  if (worker.address.socketPath && existsSync(worker.address.socketPath)) {
    await fsp.rm(worker.address.socketPath).catch(() => {});
  }
}

export function createDevServer(nitro: Nitro): NitroDevServer {
  // Worker
  const workerEntry = resolve(
    nitro.options.output.dir,
    nitro.options.output.serverDir,
    "index.mjs"
  );

  // Error handler
  const errorHandler = nitro.options.devErrorHandler || defaultErrorHandler;

  let lastError: H3Error = null;
  let reloadPromise: Promise<void> = null;

  let currentWorker: NitroWorker = null;
  async function _reload() {
    // Kill old worker
    const oldWorker = currentWorker;
    currentWorker = null;
    await killWorker(oldWorker, nitro);
    // Create a new worker
    currentWorker = await initWorker(workerEntry);
    // Write nitro.json
    const buildInfoPath = resolve(nitro.options.buildDir, "nitro.json");
    const buildInfo: NitroBuildInfo = {
      date: new Date().toJSON(),
      preset: nitro.options.preset,
      framework: nitro.options.framework,
      versions: {
        nitro: nitroVersion,
      },
      dev: {
        pid: process.pid,
        workerAddress: currentWorker?.address,
      },
    };
    await writeFile(buildInfoPath, JSON.stringify(buildInfo, null, 2));
  }
  const reload = debounce(() => {
    reloadPromise = _reload()
      .then(() => {
        lastError = null;
      })
      .catch((error) => {
        console.error("[worker reload]", error);
        lastError = error;
      })
      .finally(() => {
        reloadPromise = null;
      });
    return reloadPromise;
  });
  nitro.hooks.hook("dev:reload", reload);

  // App
  const app = createApp();

  // Dev-only handlers
  for (const handler of nitro.options.devHandlers) {
    app.use(handler.route || "/", handler.handler);
  }
  // Debugging endpoint to view vfs
  app.use("/_vfs", createVFSHandler(nitro));

  // Serve asset dirs
  for (const asset of nitro.options.publicAssets) {
    const url = joinURL(nitro.options.runtimeConfig.app.baseURL, asset.baseURL);
    app.use(url, fromNodeMiddleware(serveStatic(asset.dir)));
    if (!asset.fallthrough) {
      app.use(url, fromNodeMiddleware(servePlaceholder()));
    }
  }

  // User defined dev proxy
  for (const route of Object.keys(nitro.options.devProxy).sort().reverse()) {
    let opts = nitro.options.devProxy[route];
    if (typeof opts === "string") {
      opts = { target: opts };
    }
    const proxy = createProxy(opts);
    app.use(
      route,
      eventHandler(async (event) => {
        const { rewrite } = opts;
        if (rewrite) {
          event.path = rewrite(event.path);
          event.node.req.url = event.path;
        }
        await proxy.handle(event);
      })
    );
  }

  // Main worker proxy
  const proxy = createProxy();
  proxy.proxy.on("proxyReq", (proxyReq, req) => {
    // TODO: Use httpxy to set these headers
    if (!proxyReq.hasHeader("x-forwarded-for")) {
      proxyReq.appendHeader("x-forwarded-for", req.socket.remoteAddress);
    }
    if (!proxyReq.hasHeader("x-forwarded-port")) {
      const localPort = req?.socket?.localPort;
      if (localPort) {
        proxyReq.setHeader("x-forwarded-port", req.socket.localPort);
      }
    }
    if (!proxyReq.hasHeader("x-forwarded-Proto")) {
      const encrypted = (req?.connection as TLSSocket)?.encrypted;
      proxyReq.setHeader("x-forwarded-proto", encrypted ? "https" : "http");
    }
  });

  const getWorkerAddress = () => {
    const address = currentWorker?.address;
    if (!address) {
      return;
    }
    if (address.socketPath) {
      try {
        accessSync(address.socketPath);
      } catch (err) {
        if (!lastError) {
          lastError = err;
        }
        return;
      }
    }
    return address;
  };

  app.use(
    eventHandler(async (event) => {
      await reloadPromise;
      const address = getWorkerAddress();
      if (!address) {
        return errorHandler(lastError, event);
      }
      await proxy.handle(event, { target: address as any }).catch((err) => {
        lastError = err;
        throw err;
      });
    })
  );

  // Listen
  let listeners: Listener[] = [];
  const _listen: NitroDevServer["listen"] = async (port, opts?) => {
    const listener = await listen(toNodeListener(app), { port, ...opts });
    listeners.push(listener);
    return listener;
  };

  // Optional watcher
  let watcher: FSWatcher = null;
  if (nitro.options.devServer.watch.length > 0) {
    watcher = watch(nitro.options.devServer.watch, nitro.options.watchOptions);
    watcher.on("add", reload).on("change", reload);
  }

  // Close handler
  async function close() {
    if (watcher) {
      await watcher.close();
    }
    await killWorker(currentWorker, nitro);
    await Promise.all(listeners.map((l) => l.close()));
    listeners = [];
  }
  nitro.hooks.hook("close", close);

  return {
    reload,
    listen: _listen,
    app,
    close,
    watcher,
  };
}

function createProxy(defaults: ProxyServerOptions = {}) {
  const proxy = createProxyServer(defaults);
  const handle = async (event: H3Event, opts: ProxyServerOptions = {}) => {
    try {
      await proxy.web(event.node.req, event.node.res, opts);
    } catch (error) {
      if (error.code !== "ECONNRESET") {
        throw error;
      }
    }
  };
  return {
    proxy,
    handle,
  };
}
