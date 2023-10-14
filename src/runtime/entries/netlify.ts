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
    event.headers["Cache-Control"] = "public,max-age=0,must-revalidate";
    if (typeof routeRules.isr === "number") {
      event.headers[
        "Netlify-CDN-Cache-Control"
      ] = `public,max-age=${routeRules.isr},must-revalidate`;
    } else {
      event.headers[
        "Netlify-CDN-Cache-Control"
      ] = `public,max-age=0,stale-while-revalidate=31536000`;
    }
  }

  return lambda(event, context);
};
