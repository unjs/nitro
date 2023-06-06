import { type HandlerDefinition } from "./virtual/server-handlers";

interface HandlerWithFallback extends HandlerDefinition {
  fallback?: boolean;
  fallbackTo?: string;
  fallbackMethod?: HandlerDefinition["method"];
}

export const getHandlersWithFallbacks = (
  handlers: HandlerDefinition[],
  config: any
): HandlerWithFallback[] => {
  if (!config.routesWithFallback || config.routesWithFallback.length === 0) {
    return handlers;
  }
  const routes = config.routesWithFallback.map(
    ({ route }) => route
  ) as string[];
  const routesWithFallbacks = handlers
    .filter((h) => routes.includes(h.route))
    .map((h) => {
      const { fallbackTo, method = "get" } = config.routesWithFallback.find(
        ({ route }) => route === h.route
      );
      return { ...h, fallback: true, fallbackTo, fallbackMethod: method };
    });
  return [...handlers, ...routesWithFallbacks];
};
