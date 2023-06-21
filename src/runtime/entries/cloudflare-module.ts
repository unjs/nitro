import "#internal/nitro/virtual/polyfill";
import { withoutBase } from "ufo";
import type { ExecutionContext } from "@cloudflare/workers-types";
import {
  getAssetFromKV,
  mapRequestToAsset,
} from "@cloudflare/kv-asset-handler";
// @ts-ignore Bundled by Wrangler
// See https://github.com/cloudflare/kv-asset-handler#asset_manifest-required-for-es-modules
import manifest from "__STATIC_CONTENT_MANIFEST";
import { requestHasBody } from "../utils";
import { nitroApp } from "#internal/nitro/app";
import { useRuntimeConfig } from "#internal/nitro";
import { getPublicAssetMeta } from "#internal/nitro/virtual/public-assets";

interface CFModuleEnv {
  [key: string]: any;
}

export default {
  async fetch(
    request: Request, // CFRequest,
    env: CFModuleEnv,
    context: ExecutionContext
  ) {
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
