import { hash } from "ohash";
import {
  handleCacheHeaders,
  defineEventHandler,
  createEvent,
  EventHandler,
  isEvent,
  splitCookiesString,
  fetchWithEvent,
} from "h3";
import type { EventHandlerRequest, EventHandlerResponse, H3Event } from "h3";
import { parseURL } from "ufo";
import { useStorage } from "./storage";
import { useNitroApp } from "./app";
import type { $Fetch, NitroFetchRequest } from "nitropack";

export interface CacheEntry<T = any> {
  value?: T;
  expires?: number;
  mtime?: number;
  integrity?: string;
}

export interface CacheOptions<T = any> {
  name?: string;
  getKey?: (...args: any[]) => string | Promise<string>;
  transform?: (entry: CacheEntry<T>, ...args: any[]) => any;
  validate?: (entry: CacheEntry<T>) => boolean;
  shouldInvalidateCache?: (...args: any[]) => boolean | Promise<boolean>;
  shouldBypassCache?: (...args: any[]) => boolean | Promise<boolean>;
  group?: string;
  integrity?: any;
  /**
   * Number of seconds to cache the response. Defaults to 1.
   */
  maxAge?: number;
  swr?: boolean;
  staleMaxAge?: number;
  base?: string;
}

const defaultCacheOptions = {
  name: "_",
  base: "/cache",
  swr: true,
  maxAge: 1,
};

export function defineCachedFunction<T, ArgsT extends unknown[] = unknown[]>(
  fn: (...args: ArgsT) => T | Promise<T>,
  opts: CacheOptions<T> = {}
): (...args: ArgsT) => Promise<T> {
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
          if (event && event.waitUntil) {
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

function getKey(...args: string[]) {
  return args.length > 0 ? hash(args, {}) : "";
}

export interface ResponseCacheEntry<T = any> {
  body: T;
  code: number;
  headers: Record<string, string | number | string[]>;
  _base64Encoded?: true;
}

export interface CachedEventHandlerOptions<T = any>
  extends Omit<CacheOptions<ResponseCacheEntry<T>>, "transform" | "validate"> {
  shouldInvalidateCache?: (event: H3Event) => boolean | Promise<boolean>;
  shouldBypassCache?: (event: H3Event) => boolean | Promise<boolean>;
  getKey?: (event: H3Event) => string | Promise<string>;
  headersOnly?: boolean;
  varies?: string[] | readonly string[];
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
    transform(entry) {
      // TODO use unstorage raw API https://github.com/unjs/unstorage/issues/142
      if (entry.value._base64Encoded) {
        entry.value.body = Buffer.from(
          entry.value.body as any as string,
          "base64"
        ) as Response;
        delete entry.value._base64Encoded;
      }
    },
    getKey: async (event: H3Event) => {
      // Custom user-defined key
      const customKey = await opts.getKey?.(event);
      if (customKey) {
        return escapeKey(customKey);
      }
      // Auto-generated key
      const _path =
        event.node.req.originalUrl || event.node.req.url || event.path;
      const _pathname =
        escapeKey(decodeURI(parseURL(_path).pathname)).slice(0, 16) || "index";
      const _hashedPath = `${_pathname}.${hash(_path)}`;
      const _headers = variableHeaderNames
        .map((header) => [header, event.node.req.headers[header]])
        .map(([name, value]) => `${escapeKey(name)}.${hash(value)}`);
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
      const variableHeaders: Record<string, string | string[]> = {};
      for (const header of variableHeaderNames) {
        variableHeaders[header] = incomingEvent.node.req.headers[header];
      }

      // Create proxies to avoid sharing state with user request
      const reqProxy = cloneWithProxy(incomingEvent.node.req, {
        headers: variableHeaders,
      });
      const resHeaders: Record<string, number | string | string[]> = {};
      let _resSendBody;
      const resProxy = cloneWithProxy(incomingEvent.node.res, {
        statusCode: 200,
        writableEnded: false,
        writableFinished: false,
        headersSent: false,
        closed: false,
        getHeader(name) {
          return resHeaders[name];
        },
        setHeader(name, value) {
          resHeaders[name] = value as any;
          return this;
        },
        getHeaderNames() {
          return Object.keys(resHeaders);
        },
        hasHeader(name) {
          return name in resHeaders;
        },
        removeHeader(name) {
          delete resHeaders[name];
        },
        getHeaders() {
          return resHeaders;
        },
        end(chunk, arg2?, arg3?) {
          if (typeof chunk === "string") {
            _resSendBody = chunk;
          }
          if (typeof arg2 === "function") {
            arg2();
          }
          if (typeof arg3 === "function") {
            arg3();
          }
          return this;
        },
        write(chunk, arg2?, arg3?) {
          if (typeof chunk === "string") {
            _resSendBody = chunk;
          }
          if (typeof arg2 === "function") {
            arg2();
          }
          if (typeof arg3 === "function") {
            arg3();
          }
          return this;
        },
        writeHead(statusCode, headers) {
          this.statusCode = statusCode;
          if (headers) {
            for (const header in headers) {
              this.setHeader(header, headers[header]);
            }
          }
          return this;
        },
      });

      // Call handler
      const event = createEvent(reqProxy, resProxy);
      // Assign bound fetch to context
      event.fetch = (url, fetchOptions) =>
        fetchWithEvent(event, url, fetchOptions, {
          fetch: useNitroApp().localFetch,
        });
      event.$fetch = ((url, fetchOptions) =>
        fetchWithEvent(event, url, fetchOptions as RequestInit, {
          fetch: globalThis.$fetch,
        })) as $Fetch<unknown, NitroFetchRequest>;
      event.context = incomingEvent.context;
      const body = (await handler(event)) || _resSendBody;

      // Collect cachable headers
      const headers = event.node.res.getHeaders();
      headers.etag = String(
        headers.Etag || headers.etag || `W/"${hash(body)}"`
      );
      headers["last-modified"] = String(
        headers["Last-Modified"] ||
          headers["last-modified"] ||
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
        headers["cache-control"] = cacheControl.join(", ");
      }

      // Create cache entry for response
      const cacheEntry: ResponseCacheEntry<Response> = {
        code: event.node.res.statusCode,
        headers,
        body,
      };
      // TODO use unstorage raw API https://github.com/unjs/unstorage/issues/142
      if (cacheEntry.body instanceof Buffer) {
        cacheEntry.body = Buffer.from(body as ArrayBuffer).toString(
          "base64"
        ) as Response;
        cacheEntry._base64Encoded = true;
      }
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
    const response = await _cachedHandler(event);

    // Don't continue if response is already handled by user
    if (event.node.res.headersSent || event.node.res.writableEnded) {
      return response.body;
    }

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
    event.node.res.statusCode = response.code;
    for (const name in response.headers) {
      const value = response.headers[name];
      if (name === "set-cookie") {
        // TODO: Show warning and remove this header in the next major version of Nitro
        event.node.res.appendHeader(
          name,
          splitCookiesString(value as string[])
        );
      } else {
        event.node.res.setHeader(name, value);
      }
    }

    // Send body
    return response.body;
  });
}

function cloneWithProxy<T extends object = any>(
  obj: T,
  overrides: Partial<T>
): T {
  return new Proxy(obj, {
    get(target, property, receiver) {
      if (property in overrides) {
        return overrides[property];
      }
      return Reflect.get(target, property, receiver);
    },
    set(target, property, value, receiver) {
      if (property in overrides) {
        overrides[property] = value;
        return true;
      }
      return Reflect.set(target, property, value, receiver);
    },
  });
}

export const cachedEventHandler = defineCachedEventHandler;
