import "#nitro-internal-pollyfills";
import { useNitroApp, useRuntimeConfig } from "nitropack/runtime";
import { requestHasBody, runCronTasks } from "nitropack/runtime/internal";
import { getPublicAssetMeta } from "#nitro-internal-virtual/public-assets";

import {
  getAssetFromKV,
  mapRequestToAsset,
} from "@cloudflare/kv-asset-handler";
import type { ExportedHandler } from "@cloudflare/workers-types";
import wsAdapter from "crossws/adapters/cloudflare";
import { withoutBase } from "ufo";

// @ts-ignore Bundled by Wrangler
// See https://github.com/cloudflare/kv-asset-handler#asset_manifest-required-for-es-modules
import manifest from "__STATIC_CONTENT_MANIFEST";

const nitroApp = useNitroApp();

const ws = import.meta._websocket
  ? wsAdapter(nitroApp.h3App.websocket)
  : undefined;

interface Env {
  __STATIC_CONTENT?: any;
}

export default <ExportedHandler<Env>>{
  async fetch(request, env, context) {
    // Websocket upgrade
    // https://crossws.unjs.io/adapters/cloudflare
    if (
      import.meta._websocket &&
      request.headers.get("upgrade") === "websocket"
    ) {
      return ws!.handleUpgrade(request as any, env, context);
    }

    try {
      // https://github.com/cloudflare/kv-asset-handler#es-modules
      return await getAssetFromKV(
        {
          request: request as unknown as Request,
          waitUntil(promise) {
            return context.waitUntil(promise);
          },
        },
        {
          cacheControl: assetsCacheControl,
          mapRequestToAsset: baseURLModifier,
          ASSET_NAMESPACE: env.__STATIC_CONTENT,
          ASSET_MANIFEST: JSON.parse(manifest),
        }
      );
    } catch {
      // Ignore
    }

    const url = new URL(request.url);
    let body;
    if (requestHasBody(request as unknown as Request)) {
      body = Buffer.from(await request.arrayBuffer());
    }

    // Expose latest env to the global context
    (globalThis as any).__env__ = env;

    return nitroApp.localFetch(url.pathname + url.search, {
      context: {
        cf: (request as any).cf,
        waitUntil: (promise: Promise<any>) => context.waitUntil(promise),
        cloudflare: {
          request,
          env,
          context,
        },
      },
      host: url.hostname,
      protocol: url.protocol,
      method: request.method,
      headers: request.headers as unknown as Headers,
      body,
    });
  },

  scheduled(controller, env, context) {
    (globalThis as any).__env__ = env;
    context.waitUntil(
      nitroApp.hooks.callHook("cloudflare:scheduled", {
        controller,
        env,
        context,
      })
    );
    if (import.meta._tasks) {
      context.waitUntil(
        runCronTasks(controller.cron, {
          context: {
            cloudflare: {
              env,
              context,
            },
          },
          payload: {},
        })
      );
    }
  },

  email(message, env, context) {
    (globalThis as any).__env__ = env;
    context.waitUntil(
      nitroApp.hooks.callHook("cloudflare:email", {
        message,
        event: message, // backward compat
        env,
        context,
      })
    );
  },

  queue(batch, env, context) {
    (globalThis as any).__env__ = env;
    context.waitUntil(
      nitroApp.hooks.callHook("cloudflare:queue", {
        batch,
        event: batch,
        env,
        context,
      })
    );
  },

  tail(traces, env, context) {
    (globalThis as any).__env__ = env;
    context.waitUntil(
      nitroApp.hooks.callHook("cloudflare:tail", {
        traces,
        env,
        context,
      })
    );
  },

  trace(traces, env, context) {
    (globalThis as any).__env__ = env;
    context.waitUntil(
      nitroApp.hooks.callHook("cloudflare:trace", {
        traces,
        env,
        context,
      })
    );
  },

  test(controller, env, context) {
    (globalThis as any).__env__ = env;
    context.waitUntil(
      nitroApp.hooks.callHook("cloudflare:test", {
        controller,
        env,
        context,
      })
    );
  },
};

function assetsCacheControl(_request: Request) {
  const url = new URL(_request.url);
  const meta = getPublicAssetMeta(url.pathname);
  if (meta.maxAge) {
    return {
      browserTTL: meta.maxAge,
      edgeTTL: meta.maxAge,
    };
  }
  return {};
}

const baseURLModifier = (request: Request) => {
  const url = withoutBase(request.url, useRuntimeConfig().app.baseURL);
  return mapRequestToAsset(new Request(url, request));
};
