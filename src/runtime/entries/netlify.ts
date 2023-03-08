import "#internal/nitro/virtual/polyfill";
import type { Handler } from "@netlify/functions/dist/main";
import { withQuery } from "ufo";
import { getRouteRulesForPath } from "../route-rules";
import { lambda } from "./netlify-lambda";

export const handler: Handler = async function handler(event, context) {
  const query = {
    ...event.queryStringParameters,
    ...event.multiValueQueryStringParameters,
  };
  const url = withQuery(event.path, query);
  const routeRules = getRouteRulesForPath(url);

  if (routeRules.cache && (routeRules.cache.swr || routeRules.cache.static)) {
    const builder = await import("@netlify/functions").then(
      (r) => r.builder || r.default.builder
    );
    const ttl =
      typeof routeRules.cache.swr === "number" ? routeRules.cache.swr : 60;
    const swrHandler = routeRules.cache.swr
      ? (((event, context) =>
          lambda(event, context).then((r) => ({ ...r, ttl }))) as Handler)
      : lambda;
    return builder(swrHandler)(event, context) as any;
  }

  return lambda(event, context);
};
