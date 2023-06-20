import "#internal/nitro/virtual/polyfill";
import { nitroApp } from "../app";
import { isPublicAssetURL } from "#internal/nitro/virtual/public-assets";

addEventListener("fetch", (event: any) => {
  const url = new URL(event.request.url);
  if (isPublicAssetURL(url.pathname) || url.pathname.includes("/_server/")) {
    return;
  }

  event.respondWith(handleEvent(url, event));
});

async function handleEvent(url, event) {
  let body;
  if (event.request.body) {
    body = await event.request.arrayBuffer();
  }

  const r = await nitroApp.localCall({
    event,
    url: url.pathname + url.search,
    host: url.hostname,
    protocol: url.protocol,
    headers: event.request.headers,
    method: event.request.method,
    redirect: event.request.redirect,
    body,
  });

  return new Response(r.body, {
    headers: r.headers as HeadersInit,
    status: r.status,
    statusText: r.statusText,
  });
}

declare const self: ServiceWorkerGlobalScope;

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});
