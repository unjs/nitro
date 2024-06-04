import "#nitro-internal-pollyfills";
import { requestHasBody } from "nitropack/runtime/internal/utils";
import { useNitroApp } from "nitropack/runtime";
import { useRuntimeConfig } from "nitropack/runtime";
import { runCronTasks } from "nitropack/runtime/internal/task";
import { getPublicAssetMeta } from "#nitro-internal-virtual/public-assets";

import { withoutBase } from "ufo";
import wsAdapter from "crossws/adapters/cloudflare";
import type { ExecutionContext } from "@cloudflare/workers-types";
import {
  getAssetFromKV,
  mapRequestToAsset,
} from "@cloudflare/kv-asset-handler";

// @ts-ignore Bundled by Wrangler
// See https://github.com/cloudflare/kv-asset-handler#asset_manifest-required-for-es-modules
import manifest from "__STATIC_CONTENT_MANIFEST";

const nitroApp = useNitroApp();

const ws = import.meta._websocket
  ? wsAdapter(nitroApp.h3App.websocket)
  : undefined;

interface CFModuleEnv {
  [key: string]: any;
}

export default {
  async fetch(request: Request, env: CFModuleEnv, context: ExecutionContext) {
    // Websocket upgrade
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
          request,
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
    if (requestHasBody(request)) {
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
      headers: request.headers,
      body,
    });
  },
  scheduled(event: any, env: CFModuleEnv, context: ExecutionContext) {
    if (import.meta._tasks) {
      (globalThis as any).__env__ = env;
      context.waitUntil(
        runCronTasks(event.cron, {
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
