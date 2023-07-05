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

  if (routeRules.isr) {
    const builder = await import("@netlify/functions").then(
      (r) => r.builder || r.default.builder,
    );
    const ttl = typeof routeRules.isr === "number" ? routeRules.isr : false;
    const builderHandler = ttl
      ? (((event, context) =>
          lambda(event, context).then((r) => ({ ...r, ttl }))) as Handler)
      : lambda;
    return builder(builderHandler)(event, context) as any;
  }

  return lambda(event, context);
};
