import "#internal/nitro/virtual/polyfill";
import { requestHasBody } from "nitropack/runtime/utils";
import { nitroApp } from "nitropack/runtime/app";
import { useRuntimeConfig } from "nitropack/runtime";
import { getPublicAssetMeta } from "#internal/nitro/virtual/public-assets";

import { withoutBase } from "ufo";
import wsAdapter from "crossws/adapters/cloudflare";
import {
  getAssetFromKV,
  mapRequestToAsset,
} from "@cloudflare/kv-asset-handler";

addEventListener("fetch", (event: any) => {
  event.respondWith(handleEvent(event));
});

const ws = import.meta._websocket
  ? wsAdapter(nitroApp.h3App.websocket)
  : undefined;

async function handleEvent(event: FetchEvent) {
  // Websocket upgrade
  if (
    import.meta._websocket &&
    event.request.headers.get("upgrade") === "websocket"
  ) {
    return ws!.handleUpgrade(event.request as any, {}, event as any);
  }

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
      waitUntil: (promise: Promise<any>) => event.waitUntil(promise),
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
