import "#internal/nitro/virtual/polyfill";
import {
  getAssetFromKV,
  mapRequestToAsset,
} from "@cloudflare/kv-asset-handler";
import { withLeadingSlash, withoutBase, withoutTrailingSlash } from "ufo";
import { splitCookiesString } from "h3";
import { requestHasBody } from "../utils";
import { nitroApp } from "#internal/nitro/app";
import { useRuntimeConfig } from "#internal/nitro";
import {
  getPublicAssetMeta,
  isPublicAssetURL,
} from "#internal/nitro/virtual/public-assets";

addEventListener("fetch", (event: any) => {
  event.respondWith(handleEvent(event));
});

async function handleEvent(event: FetchEvent) {
  const url = new URL(event.request.url);
  const id = decodeURIComponent(
    withLeadingSlash(withoutTrailingSlash(url.pathname))
  );

  // Fetch public assets from KV only
  if (isPublicAssetURL(id)) {
    try {
      return await getAssetFromKV(event, {
        cacheControl: assetsCacheControl,
        mapRequestToAsset: baseURLModifier,
      });
    } catch (e) {
      return new Response(e.message || e.toString(), { status: 404 });
    }
  }

  let body;
  if (requestHasBody(event.request)) {
    body = Buffer.from(await event.request.arrayBuffer());
  }

  const r = await nitroApp.localCall({
    event,
    context: {
      // https://developers.cloudflare.com/workers//runtime-apis/request#incomingrequestcfproperties
      cf: (event.request as any).cf,
    },
    url: url.pathname + url.search,
    host: url.hostname,
    protocol: url.protocol,
    headers: Object.fromEntries(event.request.headers.entries()),
    method: event.request.method,
    redirect: event.request.redirect,
    body,
  });

  const headers = normalizeOutgoingHeaders(r.headers);

  return new Response(r.body, {
    // @ts-ignore TODO: Should be HeadersInit instead of string[][]
    headers,
    status: r.status,
    statusText: r.statusText,
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

function normalizeOutgoingHeaders(
  headers: Record<string, string | string[] | undefined>
): Headers {
  const result = new Headers();

  for (const [k, v] of Object.entries(headers)) {
    if (k === "set-cookie") {
      for (const cookie of splitCookiesString(Array.isArray(v) ? v.join(',') : v)) {
        result.append("set-cookie", cookie);
      }

      continue;
    }

    result.append(k, Array.isArray(v) ? v.join(",") : v);
  }

  return result;
}
