import { hash } from "ohash";
import type { Nitro, NitroRouteRules, NitroEventHandler } from "../../types";
import { virtual } from "./virtual";

export function handlers(nitro: Nitro) {
  const getHandlers = () =>
    [
      ...nitro.scannedHandlers,
      ...nitro.options.handlers,
    ] as NitroEventHandler[];

  return virtual(
    {
      "#internal/nitro/virtual/server-handlers": () => {
        const handlers = getHandlers();
        if (nitro.options.serveStatic) {
          handlers.unshift({
            middleware: true,
            handler: "#internal/nitro/static",
          });
        }
        if (nitro.options.renderer) {
          handlers.push({
            route: "/**",
            lazy: true,
            handler: nitro.options.renderer,
          });
        }

        // If this handler would render a cached route rule then we can also inject a cached event handler
        extendMiddlewareWithRuleOverlaps(handlers, nitro.options.routeRules);

        // Imports take priority
        const imports = unique(
          handlers.filter((h) => !h.lazy).map((h) => h.handler)
        );

        // Lazy imports should fill in the gaps
        // TODO: At least warn if a handler is imported both lazy and non lazy
        const lazyImports = unique(
          handlers.filter((h) => h.lazy).map((h) => h.handler)
        );

        const handlersMeta = getHandlers()
          .filter((h) => h.route)
          .map((h) => {
            return {
              route: h.route,
              method: h.method,
            };
          });

        const code = `
${imports
  .map((handler) => `import ${getImportId(handler)} from '${handler}';`)
  .join("\n")}

${lazyImports
  .map(
    (handler) =>
      `const ${getImportId(handler, true)} = () => import('${handler}');`
  )
  .join("\n")}

export const handlers = [
${handlers
  .map(
    (h) =>
      `  { route: '${h.route || ""}', handler: ${getImportId(
        h.handler,
        h.lazy
      )}, lazy: ${!!h.lazy}, middleware: ${!!h.middleware}, formAction: ${!!h.formAction}, method: ${JSON.stringify(
        h.method
      )} }`
  )
  .join(",\n")}
];

export const handlersMeta = ${JSON.stringify(handlersMeta, null, 2)}
  `.trim();
        return code;
      },
    },
    nitro.vfs
  );
}

function unique(arr: any[]) {
  return [...new Set(arr)];
}

function getImportId(p: string, lazy?: boolean) {
  return (lazy ? "_lazy_" : "_") + hash(p).slice(0, 6);
}

const WILDCARD_PATH_RE = /\/\*\*.*$/;

function extendMiddlewareWithRuleOverlaps(
  handlers: NitroEventHandler[],
  routeRules: Record<string, NitroRouteRules>
) {
  const rules = Object.entries(routeRules);
  for (const [path, rule] of rules) {
    // We can ignore this rule if it is not cached and it isn't nested in a cached route
    if (!rule.cache) {
      // If we are nested 'within' a cached route, we want to inject a non-cached event handler
      const isNested = rules.some(
        ([p, r]) =>
          r.cache &&
          WILDCARD_PATH_RE.test(p) &&
          path.startsWith(p.replace(WILDCARD_PATH_RE, ""))
      );
      if (!isNested) {
        continue;
      }
    }
    for (const [index, handler] of handlers.entries()) {
      // Skip middleware
      if (!handler.route || handler.middleware) {
        continue;
      }
      // We will correctly register this rule as a cached route anyway
      if (handler.route === path) {
        break;
      }
      // We are looking for handlers that will render a route _despite_ not
      // having an identical path to it
      if (!WILDCARD_PATH_RE.test(handler.route)) {
        continue;
      }
      if (!path.startsWith(handler.route.replace(WILDCARD_PATH_RE, ""))) {
        continue;
      }
      handlers.splice(index, 0, {
        ...handler,
        route: path,
      });
      break;
    }
  }
}
