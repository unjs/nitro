import "#internal/nitro/virtual/polyfill";
import type {
  Handler,
  HandlerResponse,
  HandlerContext,
  HandlerEvent,
} from "@netlify/functions/dist/main";
import type { APIGatewayProxyEventHeaders } from "aws-lambda";
import { withQuery } from "ufo";
import { nitroApp } from "../app";

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
    headers: normalizeIncomingHeaders(event.headers),
    method,
    query,
    body: event.body, // TODO: handle event.isBase64Encoded
  });

  return {
    statusCode: r.status,
    headers: normalizeOutgoingHeaders(r.headers),
    body: r.body.toString(),
  };
}

function normalizeIncomingHeaders(headers?: APIGatewayProxyEventHeaders) {
  return Object.fromEntries(
    Object.entries(headers || {}).map(([key, value]) => [
      key.toLowerCase(),
      value!,
    ])
  );
}

function normalizeOutgoingHeaders(
  headers: Record<string, string | string[] | undefined>
) {
  return Object.fromEntries(
    Object.entries(headers)
      .filter(([key]) => !["set-cookie"].includes(key))
      .map(([k, v]) => [k, Array.isArray(v) ? v.join(",") : v!])
  );
}
