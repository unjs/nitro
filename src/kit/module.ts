import { NitroDevEventHandler, NitroEventHandler } from "../types/handler";
import { fileURLToPath } from "node:url";
import { NitroModule } from "../types/module";
import { useNitro } from "./context";
import { normalize } from "pathe";
import { RouterMethod } from "h3";

/**
 * Defines a Nitro module.
 */
export function defineNitroModule(def: NitroModule): NitroModule {
  if (typeof def?.setup !== "function") {
    def.setup = () => {
      throw new TypeError("NitroModule must implement a `setup` method!");
    };
  }
  return def;
}

/**
 * Normalize handler object.
 *
 * @credits https://github.com/nuxt/nuxt/blob/main/packages/kit/src/nitro.ts#L11
 */
function normalizeHandlerMethod(handler: NitroEventHandler) {
  // retrieve method from handler file name
  const [, method = undefined] =
    handler.handler.match(
      /\.(get|head|patch|post|put|delete|connect|options|trace)(\.\w+)*$/
    ) || [];
  return {
    method: method as RouterMethod | undefined,
    ...handler,
    handler: normalize(handler.handler),
  } satisfies NitroEventHandler;
}

/**
 * Resolves a path relative to the current module.
 */
export function createResolver(url: string) {
  return (path: string) => fileURLToPath(new URL(path, url));
}

/**
 * Converts a value to an array.
 *
 * @credits https://github.com/nuxt/nuxt/blob/main/packages/kit/src/utils.ts#L2
 */
function toArray<T>(value: T | T[]): T[] {
  return Array.isArray(value) ? value : [value];
}

/**
 * Adds a Nitro server handler.
 */

export function addEventHandler(handler: NitroEventHandler): void {
  const nitro = useNitro();
  nitro.options.handlers ||= [];
  nitro.options.handlers.push(normalizeHandlerMethod(handler));
}

/**
 * Adds a Nitro server handler for development-only
 *
 */
export function addDevEventHandler(handler: NitroDevEventHandler) {
  const nitro = useNitro();
  nitro.options.devHandlers ||= [];
  nitro.options.devHandlers.push(handler);
}

/**
 * Adds a Nitro plugin
 */
export function addPlugin(plugin: string) {
  const nitro = useNitro();
  nitro.options.plugins ||= [];
  nitro.options.plugins.push(normalize(plugin));
}

/**
 * Adds routes to be prerendered
 */
export function addPrerenderRoutes(routes: string | string[]) {
  const nitro = useNitro();

  routes = toArray(routes).filter(Boolean);
  if (!routes.length) {
    return;
  }
  nitro.hooks.hook("prerender:routes", (ctx) => {
    for (const route of routes) {
      ctx.add(route);
    }
  });
}
