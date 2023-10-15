import "#internal/nitro/virtual/polyfill";
import type {
  HandlerResponse,
  HandlerContext,
  HandlerEvent,
} from "@netlify/functions";
import { withQuery } from "ufo";
import { nitroApp } from "../app";
import {
  normalizeLambdaIncomingHeaders,
  normalizeLambdaOutgoingBody,
  normalizeLambdaOutgoingHeaders,
} from "../utils.lambda";
import { normalizeCookieHeader } from "../utils";
import { getRouteRulesForPath } from "../route-rules";

// Netlify functions uses lambda v1 https://docs.aws.amazon.com/apigateway/latest/developerguide/http-api-develop-integrations-lambda.html#http-api-develop-integrations-lambda.v2
export async function lambda(
  event: HandlerEvent,
  context: HandlerContext
): Promise<HandlerResponse> {
  const query = {
    ...event.queryStringParameters,
    ...event.multiValueQueryStringParameters,
  };
  const url = withQuery(event.path, query);
  const method = event.httpMethod || "get";

  const r = await nitroApp.localCall({
    event,
    url,
    context,
    headers: normalizeLambdaIncomingHeaders(event.headers),
    method,
    query,
    body: event.body, // TODO: handle event.isBase64Encoded
  });

  const cookies = normalizeCookieHeader(String(r.headers["set-cookie"]));
  const awsBody = await normalizeLambdaOutgoingBody(r.body, r.headers);

  // adding cache headers to response if not already set manually by the end user
  const routeRules = getRouteRulesForPath(url);
  if (
    routeRules.isr &&
    !Object.keys(r.headers)
      .map((hKey) => hKey.toLowerCase())
      .includes("cache-control")
  ) {
    r.headers["Cache-Control"] = "public, max-age=0, must-revalidate";
    r.headers["Netlify-CDN-Cache-Control"] =
      typeof routeRules.isr === "number"
        ? `public, max-age=${routeRules.isr}, must-revalidate`
        : `public, max-age=0, stale-while-revalidate=31536000`;
  }

  return {
    statusCode: r.status,
    headers: normalizeLambdaOutgoingHeaders(r.headers, true),
    body: awsBody.body,
    isBase64Encoded: awsBody.type === "binary",
    ...(cookies.length > 0 && {
      multiValueHeaders: { "set-cookie": cookies },
    }),
  };
}
