import {
  App as H3App,
  createApp,
  createRouter,
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

  // If this handler would render a cached route rule then we can also inject a cached event handler
  for (const rule in config.nitro.routeRules) {
    // We can ignore this rule
    if (!config.nitro.routeRules[rule].cache) {
      continue;
    }
    for (const [index, handler] of handlers.entries()) {
      // skip middleware
      if (!handler.route) {
        continue;
      }
      // we will correctly register this rule as a cached route anyway
      if (handler.route === rule) {
        break;
      }
      // We are looking for handlers that will render a route _despite_ not
      // having an identical path to it
      if (!handler.route.endsWith("/**")) {
        continue;
      }
      if (!rule.startsWith(handler.route.replace("/**", ""))) {
        continue;
      }
      handlers.splice(index, 0, {
        ...handler,
        route: rule,
      });
      break;
    }
  }

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

  const localCall = createCall(toNodeListener(h3App) as any);
  const localFetch = createLocalFetch(localCall, globalThis.fetch);

  const $fetch = createFetch({
    fetch: localFetch,
    Headers,
    defaults: { baseURL: config.app.baseURL },
  });
  // @ts-ignore
  globalThis.$fetch = $fetch;

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
