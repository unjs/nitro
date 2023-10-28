import "#internal/nitro/virtual/polyfill";
import { toPlainHandler } from "h3";
import { hasProtocol, joinURL } from "ufo";
import { toBuffer } from "../utils";
import { nitroApp } from "#internal/nitro/app";

// Types are reverse engineered from runtime

interface ExecuteRequest {
  url: URL;
  body?: ReadableStream;
  bodyUsed: boolean;
  headers: Headers;
  getMethod: () => string;
}

interface FetchEvent extends Event {
  request: ExecuteRequest;
  respondWith(response: Promise<Response> | Response): Promise<Response>;
  waitUntil: (promise: Promise<any>) => void;
}

// Use plain handler as winterjs Web API is incomplete
// TODO: Migrate to toWebHandler
const _handler = toPlainHandler(nitroApp.h3App);

async function _handleEvent(event: FetchEvent) {
  try {
    const res = await _handler({
      path:
        event.request.url.pathname +
        (event.request.url.search ? `?${event.request.url.search}` : ""),
      method: event.request.getMethod() || "GET",
      body: event.request.body,
      headers: event.request.headers,
      context: {},
    });
    const body =
      typeof res.body === "string" ? res.body : await toBuffer(res.body as any);
    return new Response(body, {
      status: res.status,
      statusText: res.statusText,
      headers: res.headers,
    });
  } catch (err) {
    const errString = err.message + "\n" + err.stack;
    console.error(errString);
    return new Response(errString, { status: 500 });
  }
}

globalThis._handleEvent = _handleEvent;

addEventListener("fetch", async (event) => {
  return await globalThis._handleEvent(event as FetchEvent);
});

// ------------------------------
// Polyfills for missing APIs
// ------------------------------
if (!Headers.prototype.entries) {
  // @ts-ignore
  Headers.prototype.entries = function () {
    return [...this];
  };
}

if (!URL.prototype.pathname) {
  Object.defineProperty(URL.prototype, "pathname", {
    get() {
      return this.path || "/";
    },
  });
}

const _URL = globalThis.URL;
globalThis.URL = class URL extends _URL {
  constructor(url, base) {
    if (!base || hasProtocol(url)) {
      super(url);
      return;
    }
    super(joinURL(base, url));
  }
};
