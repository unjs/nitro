import {
  eventHandler,
  H3Event,
  sendRedirect,
  setHeaders,
  proxyRequest,
} from "h3";
import defu from "defu";
import { createRouter as createRadixRouter, toRouteMatcher } from "radix3";
import { joinURL, withQuery, getQuery, withoutBase } from "ufo";
import { useRuntimeConfig } from "./config";
import { NitroRouteRules } from "nitropack";

const config = useRuntimeConfig();
const _routeRulesMatcher = toRouteMatcher(
  createRadixRouter({ routes: config.nitro.routeRules })
);

export function createRouteRulesHandler(ctx: {
  localFetch: typeof globalThis.fetch;
}) {
  return eventHandler((event) => {
    // Match route options against path
    const routeRules = getRouteRules(event);
    // Apply headers options
    if (routeRules.headers) {
      setHeaders(event, routeRules.headers);
    }
    // Apply redirect options
    if (routeRules.redirect) {
      let target = routeRules.redirect.to;
      if (target.endsWith("/**")) {
        let targetPath = event.path;
        const strpBase = (routeRules.redirect as any)._redirectStripBase;
        if (strpBase) {
          targetPath = withoutBase(targetPath, strpBase);
        }
        target = joinURL(target.slice(0, -3), targetPath);
      } else if (event.path.includes("?")) {
        const query = getQuery(event.path);
        target = withQuery(target, query);
      }
      return sendRedirect(event, target, routeRules.redirect.statusCode);
    }
    // Apply proxy options
    if (routeRules.proxy) {
      let target = routeRules.proxy.to;
      if (target.endsWith("/**")) {
        let targetPath = event.path;
        const strpBase = (routeRules.proxy as any)._proxyStripBase;
        if (strpBase) {
          targetPath = withoutBase(targetPath, strpBase);
        }
        target = joinURL(target.slice(0, -3), targetPath);
      } else if (event.path.includes("?")) {
        const query = getQuery(event.path);
        target = withQuery(target, query);
      }
      return proxyRequest(event, target, {
        fetch: ctx.localFetch,
        ...routeRules.proxy,
      });
    }
  });
}

export function getRouteRules(event: H3Event): NitroRouteRules {
  event.context._nitro = event.context._nitro || {};
  if (!event.context._nitro.routeRules) {
    event.context._nitro.routeRules = getRouteRulesForPath(
      withoutBase(event.path.split("?")[0], useRuntimeConfig().app.baseURL)
    );
  }
  return event.context._nitro.routeRules;
}

type DeepReadonly<T> =
  T extends Record<string, any>
    ? { readonly [K in keyof T]: DeepReadonly<T[K]> }
    : T extends Array<infer U>
      ? ReadonlyArray<DeepReadonly<U>>
      : T;

export function getRouteRulesForPath(
  path: string
): DeepReadonly<NitroRouteRules> {
  return defu({}, ..._routeRulesMatcher.matchAll(path).reverse());
}
