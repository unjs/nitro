import "#internal/nitro/virtual/polyfill";
import {
  getAssetFromKV,
  mapRequestToAsset,
} from "@cloudflare/kv-asset-handler";
import { addEventListener } from "@cloudflare/workers-types";
import { withoutBase } from "ufo";
import { requestHasBody } from "../utils";
import { nitroApp } from "#internal/nitro/app";
import { useRuntimeConfig } from "#internal/nitro";
import { getPublicAssetMeta } from "#internal/nitro/virtual/public-assets";

addEventListener("scheduled", (event) => {
  return nitroApp.hooks.callHook("cloudflare:scheduled", event);
});

addEventListener("queue", (event) => {
  return nitroApp.hooks.callHook("cloudflare:queue", event);
});

addEventListener("fetch", (event: any) => {
  event.respondWith(handleEvent(event));
});

async function handleEvent(event: FetchEvent) {
  try {
    return await getAssetFromKV(event, {
      cacheControl: assetsCacheControl,
      mapRequestToAsset: baseURLModifier,
    });
  } catch {
    // Ignore
  }

  const url = new URL(event.request.url);
  let body;
  if (requestHasBody(event.request)) {
    body = Buffer.from(await event.request.arrayBuffer());
  }

  return nitroApp.localFetch(url.pathname + url.search, {
    context: {
      // https://developers.cloudflare.com/workers//runtime-apis/request#incomingrequestcfproperties
      cf: (event.request as any).cf,
      waitUntil: (promise) => event.waitUntil(promise),
      cloudflare: {
        event,
      },
    },
    host: url.hostname,
    protocol: url.protocol,
    headers: event.request.headers,
    method: event.request.method,
    redirect: event.request.redirect,
    body,
  });
}

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
