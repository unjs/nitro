import {
  App as H3App,
  createApp,
  createRouter,
  eventHandler,
  lazyEventHandler,
  Router,
  toNodeListener,
  fetchWithEvent,
  H3Error,
} from "h3";
import { createFetch, Headers } from "ofetch";
import destr from "destr";
import {
  createCall,
  createFetch as createLocalFetch,
} from "unenv/runtime/fetch/index";
import { createHooks, Hookable } from "hookable";
import type { NitroRuntimeHooks } from "./types";
import { useRuntimeConfig } from "./config";
import { cachedEventHandler } from "./cache";
import { normalizeFetchResponse } from "./utils";
import { createRouteRulesHandler, getRouteRulesForPath } from "./route-rules";
import type { $Fetch, NitroFetchRequest, CaptureError } from "nitropack";
import { plugins } from "#internal/nitro/virtual/plugins";
import errorHandler from "#internal/nitro/virtual/error-handler";
import { handlers } from "#internal/nitro/virtual/server-handlers";

export interface NitroApp {
  h3App: H3App;
  router: Router;
  hooks: Hookable<NitroRuntimeHooks>;
  localCall: ReturnType<typeof createCall>;
  localFetch: ReturnType<typeof createLocalFetch>;
  captureError: CaptureError;
}

function createNitroApp(): NitroApp {
  const config = useRuntimeConfig();

  const hooks = createHooks<NitroRuntimeHooks>();

  const captureError: CaptureError = (error, context = {}) => {
    const promise = hooks
      .callHookParallel("error", error, context)
      .catch((_err) => {
        console.error("Error while capturing another error", _err);
      });
    if (context.event) {
      const errors = context.event.context.nitro?.errors;
      if (errors) {
        errors.push({ error, context });
      }
      if (context.event.waitUntil) {
        context.event.waitUntil(promise);
      }
    }
  };

  const h3App = createApp({
    debug: destr(process.env.DEBUG),
    onError: (error, event) => {
      captureError(error, { event, tags: ["request"] });
      return errorHandler(error as H3Error, event);
    },
  });

  const router = createRouter();

  h3App.use(createRouteRulesHandler());

  // Create local fetch callers
  const localCall = createCall(toNodeListener(h3App) as any);
  const _localFetch = createLocalFetch(localCall, globalThis.fetch);
  const localFetch = (...args: Parameters<typeof _localFetch>) => {
    return _localFetch(...args).then((response) =>
      normalizeFetchResponse(response)
    );
  };
  const $fetch = createFetch({
    fetch: localFetch,
    Headers,
    defaults: { baseURL: config.app.baseURL },
  });

  // @ts-ignore
  globalThis.$fetch = $fetch;

  // A generic event handler give nitro access to the requests
  h3App.use(
    eventHandler((event) => {
      // Init nitro context
      event.context.nitro = event.context.nitro || { errors: [] };

      // Support platform context provided by local fetch
      const envContext = (event.node.req as any).__unenv__;
      if (envContext) {
        Object.assign(event.context, envContext);
      }

      // Assign bound fetch to context
      event.fetch = (req, init) =>
        fetchWithEvent(event, req, init, { fetch: localFetch });
      event.$fetch = ((req, init) =>
        fetchWithEvent(event, req, init as RequestInit, {
          fetch: $fetch,
        })) as $Fetch<unknown, NitroFetchRequest>;

      // https://github.com/unjs/nitro/issues/1420
      event.waitUntil = (promise) => {
        if (!event.context.nitro._waitUntilPromises) {
          event.context.nitro._waitUntilPromises = [];
        }
        event.context.nitro._waitUntilPromises.push(promise);
        if (envContext?.waitUntil) {
          envContext.waitUntil(promise);
        }
      };

      event.captureError = (error, context) => {
        captureError(error, { event, context });
      };
    })
  );

  for (const h of handlers) {
    let handler = h.lazy ? lazyEventHandler(h.handler) : h.handler;
    if (h.middleware || !h.route) {
      const middlewareBase = (config.app.baseURL + (h.route || "/")).replace(
        /\/+/g,
        "/"
      );
      h3App.use(middlewareBase, handler);
    } else {
      const routeRules = getRouteRulesForPath(
        h.route.replace(/:\w+|\*\*/g, "_")
      );
      if (routeRules.cache) {
        handler = cachedEventHandler(handler, {
          group: "nitro/routes",
          ...routeRules.cache,
        });
      }
      router.use(h.route, handler, h.method);
    }
  }

  h3App.use(config.app.baseURL as string, router.handler);

  const app: NitroApp = {
    hooks,
    h3App,
    router,
    localCall,
    localFetch,
    captureError,
  };

  for (const plugin of plugins) {
    plugin(app);
  }

  return app;
}

export const nitroApp: NitroApp = createNitroApp();

export const useNitroApp = () => nitroApp;
