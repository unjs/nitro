/* eslint-disable require-await */
import "#internal/nitro/virtual/polyfill";
import { withoutBase } from "ufo";
import type {
  ExecutionContext as CFExecutionContext,
  ExportedHandler,
  Response as CFResponse,
} from "@cloudflare/workers-types";
import {
  getAssetFromKV,
  mapRequestToAsset,
} from "@cloudflare/kv-asset-handler";
// @ts-ignore Bundled by Wrangler
// See https://github.com/cloudflare/kv-asset-handler#asset_manifest-required-for-es-modules
import manifest from "__STATIC_CONTENT_MANIFEST";
import { requestHasBody } from "../utils";
import type { ExtendedExecutionContext } from "../types";
import { nitroApp } from "#internal/nitro/app";
import { useRuntimeConfig } from "#internal/nitro";
import { getPublicAssetMeta } from "#internal/nitro/virtual/public-assets";

interface CFModuleEnv {
  [key: string]: any;
}

export default <ExportedHandler>{
  async fetch(cfRequest, env: CFModuleEnv, context) {
    const request = cfRequest as unknown as Request;
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
    globalThis.__env__ = env;

    return nitroApp.localFetch(url.pathname + url.search, {
      context: {
        cf: (request as any).cf,
        waitUntil: (promise) => context.waitUntil(promise),
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
    }) as unknown as CFResponse;
  },
  // https://developers.cloudflare.com/queues/get-started/#5-create-your-consumer-worker
  async queue(batch, env: CFModuleEnv, context: ExtendedExecutionContext) {
    context.sendResponse = () => null;
    await nitroApp.hooks.callHook("cloudflare-module:queue", {
      batch,
      env,
      context,
    });
    return context.sendResponse();
  },
  // https://developers.cloudflare.com/workers/runtime-apis/scheduled-event/
  async scheduled(
    controller,
    env: CFModuleEnv,
    context: ExtendedExecutionContext
  ) {
    context.sendResponse = () => null;
    await nitroApp.hooks.callHook("cloudflare-module:scheduled", {
      controller,
      env,
      context,
    });
    return context.sendResponse();
  },
};

function assetsCacheControl(_request) {
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
