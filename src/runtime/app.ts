import {
  App as H3App,
  createApp,
  createRouter,
  eventHandler,
  H3Event,
  lazyEventHandler,
  Router,
  toNodeListener,
} from "h3";
import { createFetch, Headers } from "ofetch";
import destr from "destr";
import {
  createCall,
  createFetch as createLocalFetch,
} from "unenv/runtime/fetch/index";
import { createHooks, Hookable } from "hookable";
import { useRuntimeConfig } from "./config";
import { cachedEventHandler } from "./cache";
import { createRouteRulesHandler, getRouteRulesForPath } from "./route-rules";
import { plugins } from "#internal/nitro/virtual/plugins";
import errorHandler from "#internal/nitro/virtual/error-handler";
import { handlers } from "#internal/nitro/virtual/server-handlers";

export interface NitroApp {
  h3App: H3App;
  router: Router;
  // TODO: Type hooks and allow extending
  hooks: Hookable;
  localCall: ReturnType<typeof createCall>;
  localFetch: ReturnType<typeof createLocalFetch>;
}

function createNitroApp(): NitroApp {
  const config = useRuntimeConfig();

  const hooks = createHooks();

  const h3App = createApp({
    debug: destr(process.env.DEBUG),
    onError: errorHandler,
  });

  const router = createRouter();

  h3App.use(createRouteRulesHandler());

  // Create local fetch callers
  const localCall = createCall(toNodeListener(h3App) as any);
  const localFetch = createLocalFetch(localCall, globalThis.fetch);
  const $fetch = createFetch({
    fetch: localFetch,
    Headers,
    defaults: { baseURL: config.app.baseURL },
  });
  // @ts-ignore
  globalThis.$fetch = $fetch;
  const fetchByEvent = (event: H3Event, path: string, init?: RequestInit) =>
    localFetch(path, {
      headers: event.node.req.headers as any,
      context: event.context,
      init,
    });
  const $fetchByEvent = (event: H3Event, path: string, init?: RequestInit) =>
    $fetch(path, {
      headers: event.node.req.headers as any,
      // @ts-ignore
      context: event.context,
      init,
    });

  // A generic event handler give nitro acess to the requests
  h3App.use(
    eventHandler((event) => {
      // Support platform context provided by local fetch
      const envContext = (event.node.req as any).__unenv__;
      if (envContext) {
        Object.assign(event.context, envContext);
      }
      // Assign bound fetch to context
      event.fetch = (path, init) => fetchByEvent(event, path, init);
      event.$fetch = (path, init) => $fetchByEvent(event, path, init);
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

  h3App.use(config.app.baseURL, router);

  const app: NitroApp = {
    hooks,
    h3App,
    router,
    localCall,
    localFetch,
  };

  for (const plugin of plugins) {
    plugin(app);
  }

  return app;
}

export const nitroApp: NitroApp = createNitroApp();

export const useNitroApp = () => nitroApp;
