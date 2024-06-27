import {
  type EventHandler,
  defineEventHandler,
  handleCacheHeaders,
  isEvent,
  callWithPlainRequest,
  setResponseStatus,
  setResponseHeaders,
} from "h3";
import type { EventHandlerRequest, EventHandlerResponse, H3Event } from "h3";
import type {
  $Fetch,
  CacheEntry,
  CacheOptions,
  CachedEventHandlerOptions,
  ResponseCacheEntry,
} from "nitro/types";
import { hash } from "ohash";
import { parseURL } from "ufo";
import { nitroApp, useNitroApp } from "./app";
import { useStorage } from "./storage";

const defaultCacheOptions = {
  name: "_",
  base: "/cache",
  swr: true,
  maxAge: 1,
};

export function defineCachedFunction<T, ArgsT extends unknown[] = any[]>(
  fn: (...args: ArgsT) => T | Promise<T>,
  opts: CacheOptions<T> = {}
): (...args: ArgsT) => Promise<T | undefined> {
  opts = { ...defaultCacheOptions, ...opts };

  const pending: { [key: string]: Promise<T> } = {};

  // Normalize cache params
  const group = opts.group || "nitro/functions";
  const name = opts.name || fn.name || "_";
  const integrity = opts.integrity || hash([fn, opts]);
  const validate = opts.validate || ((entry) => entry.value !== undefined);

  async function get(
    key: string,
    resolver: () => T | Promise<T>,
    shouldInvalidateCache?: boolean,
    event?: H3Event
  ): Promise<CacheEntry<T>> {
    // Use extension for key to avoid conflicting with parent namespace (foo/bar and foo/bar/baz)
    const cacheKey = [opts.base, group, name, key + ".json"]
      .filter(Boolean)
      .join(":")
      .replace(/:\/$/, ":index");

    let entry: CacheEntry<T> =
      ((await useStorage().getItem(cacheKey)) as unknown) || {};

    // https://github.com/unjs/nitro/issues/2160
    if (typeof entry !== "object") {
      entry = {};
      const error = new Error("Malformed data read from cache.");
      console.error("[nitro] [cache]", error);
      useNitroApp().captureError(error, { event, tags: ["cache"] });
    }

    const ttl = (opts.maxAge ?? opts.maxAge ?? 0) * 1000;
    if (ttl) {
      entry.expires = Date.now() + ttl;
    }

    const expired =
      shouldInvalidateCache ||
      entry.integrity !== integrity ||
      (ttl && Date.now() - (entry.mtime || 0) > ttl) ||
      validate(entry) === false;

    const _resolve = async () => {
      const isPending = pending[key];
      if (!isPending) {
        if (
          entry.value !== undefined &&
          (opts.staleMaxAge || 0) >= 0 &&
          opts.swr === false
        ) {
          // Remove cached entry to prevent using expired cache on concurrent requests
          entry.value = undefined;
          entry.integrity = undefined;
          entry.mtime = undefined;
          entry.expires = undefined;
        }
        pending[key] = Promise.resolve(resolver());
      }

      try {
        entry.value = await pending[key];
      } catch (error) {
        // Make sure entries that reject get removed.
        if (!isPending) {
          delete pending[key];
        }
        // Re-throw error to make sure the caller knows the task failed.
        throw error;
      }

      if (!isPending) {
        // Update mtime, integrity + validate and set the value in cache only the first time the request is made.
        entry.mtime = Date.now();
        entry.integrity = integrity;
        delete pending[key];
        if (validate(entry) !== false) {
          const promise = useStorage()
            .setItem(cacheKey, entry)
            .catch((error) => {
              console.error(`[nitro] [cache] Cache write error.`, error);
              useNitroApp().captureError(error, { event, tags: ["cache"] });
            });
          if (event?.waitUntil) {
            event.waitUntil(promise);
          }
        }
      }
    };

    const _resolvePromise = expired ? _resolve() : Promise.resolve();

    if (entry.value === undefined) {
      await _resolvePromise;
    } else if (expired && event && event.waitUntil) {
      event.waitUntil(_resolvePromise);
    }

    if (opts.swr && validate(entry) !== false) {
      _resolvePromise.catch((error) => {
        console.error(`[nitro] [cache] SWR handler error.`, error);
        useNitroApp().captureError(error, { event, tags: ["cache"] });
      });
      return entry;
    }

    return _resolvePromise.then(() => entry);
  }

  return async (...args) => {
    const shouldBypassCache = await opts.shouldBypassCache?.(...args);
    if (shouldBypassCache) {
      return fn(...args);
    }
    const key = await (opts.getKey || getKey)(...args);
    const shouldInvalidateCache = await opts.shouldInvalidateCache?.(...args);
    const entry = await get(
      key,
      () => fn(...args),
      shouldInvalidateCache,
      args[0] && isEvent(args[0]) ? args[0] : undefined
    );
    let value = entry.value;
    if (opts.transform) {
      value = (await opts.transform(entry, ...args)) || value;
    }
    return value;
  };
}

export const cachedFunction = defineCachedFunction;

function getKey(...args: unknown[]) {
  return args.length > 0 ? hash(args, {}) : "";
}

function escapeKey(key: string | string[]) {
  return String(key).replace(/\W/g, "");
}

export function defineCachedEventHandler<
  Request extends EventHandlerRequest = EventHandlerRequest,
  Response = EventHandlerResponse,
>(
  handler: EventHandler<Request, Response>,
  opts?: CachedEventHandlerOptions<Response>
): EventHandler<Omit<Request, "body">, Response>;
// TODO: remove when appropriate
// This signature provides backwards compatibility with previous signature where first generic was return type
export function defineCachedEventHandler<
  Request = Omit<EventHandlerRequest, "body">,
  Response = EventHandlerResponse,
>(
  handler: EventHandler<
    Request extends EventHandlerRequest ? Request : EventHandlerRequest,
    Request extends EventHandlerRequest ? Response : Request
  >,
  opts?: CachedEventHandlerOptions<
    Request extends EventHandlerRequest ? Response : Request
  >
): EventHandler<
  Request extends EventHandlerRequest ? Request : EventHandlerRequest,
  Request extends EventHandlerRequest ? Response : Request
>;
export function defineCachedEventHandler<
  Request extends EventHandlerRequest = EventHandlerRequest,
  Response = EventHandlerResponse,
>(
  handler: EventHandler<Request, Response>,
  opts: CachedEventHandlerOptions<Response> = defaultCacheOptions
): EventHandler<Request, Response> {
  const variableHeaderNames = (opts.varies || [])
    .filter(Boolean)
    .map((h) => h.toLowerCase())
    .sort();

  const _opts: CacheOptions<ResponseCacheEntry<Response>> = {
    ...opts,
    getKey: async (event: H3Event) => {
      // Custom user-defined key
      const customKey = await opts.getKey?.(event);
      if (customKey) {
        return escapeKey(customKey);
      }
      // Auto-generated key
      // TODO: Prefer original url
      const _path = event.path;
      const _pathname =
        escapeKey(decodeURI(parseURL(_path).pathname)).slice(0, 16) || "index";
      const _hashedPath = `${_pathname}.${hash(_path)}`;
      const _headers = [...event.headers.entries()].map(
        ([name, value]) => `${escapeKey(name as string)}.${hash(value)}`
      );
      return [_hashedPath, ..._headers].join(":");
    },
    validate: (entry) => {
      if (!entry.value) {
        return false;
      }
      if (entry.value.code >= 400) {
        return false;
      }
      if (entry.value.body === undefined) {
        return false;
      }
      // https://github.com/unjs/nitro/pull/1857
      if (
        entry.value.headers.etag === "undefined" ||
        entry.value.headers["last-modified"] === "undefined"
      ) {
        return false;
      }
      return true;
    },
    group: opts.group || "nitro/handlers",
    integrity: opts.integrity || hash([handler, opts]),
  };

  const _cachedHandler = cachedFunction<ResponseCacheEntry<Response>>(
    async (incomingEvent: H3Event) => {
      // Only pass headers which are defined in opts.varies
      const variableHeaders: Record<string, string> = {};
      for (const header of variableHeaderNames) {
        const value = incomingEvent.headers.get(header);
        if (value !== undefined && value !== null) {
          variableHeaders[header] = value;
        }
      }

      // TODO
      // event.fetch = (url, fetchOptions) =>
      //   fetchWithEvent(event, url, fetchOptions, {
      //     fetch: useNitroApp().localFetch as any,
      //   });
      // event.$fetch = ((url, fetchOptions) =>
      //   fetchWithEvent(event, url, fetchOptions as RequestInit, {
      //     fetch: globalThis.$fetch as any,
      //   })) as $Fetch<unknown, NitroFetchRequest>;

      const res = await callWithPlainRequest(
        handler,
        {
          method: incomingEvent.method,
          path: incomingEvent.path,
          headers: variableHeaders,
        },
        {
          ...incomingEvent.context,
          cache: {
            options: _opts,
          },
        },
        nitroApp.h3App
      );

      console.log(handler.toString(), res);

      // Collect cacheable headers
      res.headers.etag = String(
        res.headers.Etag || res.headers.etag || `W/"${hash(res.body)}"`
      );

      res.headers["last-modified"] = String(
        res.headers["Last-Modified"] ||
          res.headers["last-modified"] ||
          new Date().toUTCString()
      );

      const cacheControl = [];
      if (opts.swr) {
        if (opts.maxAge) {
          cacheControl.push(`s-maxage=${opts.maxAge}`);
        }
        if (opts.staleMaxAge) {
          cacheControl.push(`stale-while-revalidate=${opts.staleMaxAge}`);
        } else {
          cacheControl.push("stale-while-revalidate");
        }
      } else if (opts.maxAge) {
        cacheControl.push(`max-age=${opts.maxAge}`);
      }
      if (cacheControl.length > 0) {
        res.headers["cache-control"] = cacheControl.join(", ");
      }

      // Create cache entry for response
      const cacheEntry: ResponseCacheEntry<Response> = {
        code: res.status,
        headers: res.headers,
        body: res.body as any,
      };

      return cacheEntry;
    },
    _opts
  );

  return defineEventHandler<Request, any>(async (event) => {
    // Headers-only mode
    if (opts.headersOnly) {
      // TODO: Send SWR too
      if (handleCacheHeaders(event, { maxAge: opts.maxAge })) {
        return;
      }
      return handler(event);
    }

    // Call with cache
    const response = (await _cachedHandler(
      event
    )) as ResponseCacheEntry<Response>;

    // Check for cache headers
    if (
      handleCacheHeaders(event, {
        modifiedTime: new Date(response.headers["last-modified"] as string),
        etag: response.headers.etag as string,
        maxAge: opts.maxAge,
      })
    ) {
      return;
    }

    // Send status and headers
    setResponseStatus(event, response.code);
    setResponseHeaders(event, response.headers);

    return response.body;
  });
}

export const cachedEventHandler = defineCachedEventHandler;
