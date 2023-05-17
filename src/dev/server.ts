import { Worker } from "node:worker_threads";
import { existsSync, promises as fsp } from "node:fs";
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
import httpProxy, { ServerOptions as HTTPProxyOptions } from "http-proxy";
import { listen, Listener, ListenOptions } from "listhen";
import { servePlaceholder } from "serve-placeholder";
import serveStatic from "serve-static";
import { resolve } from "pathe";
import { joinURL } from "ufo";
import { FSWatcher, watch } from "chokidar";
import type { Nitro } from "../types";
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
      err.message = "[worker init] " + err.message;
      reject(err);
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
    await fsp.rm(worker.address.socketPath);
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
        await proxy.handle(event);
      })
    );
  }

  // Main worker proxy
  const proxy = createProxy();
  proxy.proxy.on("proxyReq", (proxyReq, req) => {
    const proxyRequestHeaders = proxyReq.getHeaders();
    if (req.socket.remoteAddress && !proxyRequestHeaders["x-forwarded-for"]) {
      proxyReq.setHeader("X-Forwarded-For", req.socket.remoteAddress);
    }
    if (req.socket.remotePort && !proxyRequestHeaders["x-forwarded-port"]) {
      proxyReq.setHeader("X-Forwarded-Port", req.socket.remotePort);
    }
    if (req.socket.remoteFamily && !proxyRequestHeaders["x-forwarded-proto"]) {
      proxyReq.setHeader("X-Forwarded-Proto", req.socket.remoteFamily);
    }
  });
  app.use(
    eventHandler(async (event) => {
      await reloadPromise;
      const address = currentWorker && currentWorker.address;
      if (!address || (address.socketPath && !existsSync(address.socketPath))) {
        return errorHandler(lastError, event);
      }
      await proxy.handle(event, { target: address }).catch((err) => {
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

function createProxy(defaults: HTTPProxyOptions = {}) {
  const proxy = httpProxy.createProxy();
  const handle = (event: H3Event, opts: HTTPProxyOptions = {}) => {
    return new Promise<void>((resolve, reject) => {
      proxy.web(
        event.node.req,
        event.node.res,
        { ...defaults, ...opts },
        (error: any) => {
          if (error.code !== "ECONNRESET") {
            reject(error);
          }
          resolve();
        }
      );
    });
  };
  return {
    proxy,
    handle,
  };
}
