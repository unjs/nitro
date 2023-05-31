import "#internal/nitro/virtual/polyfill";
import { Buffer } from "node:buffer";
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

  const headers = normalizeOutgoingHeaders(r.headers);
  // image buffers must be base64 encoded
  if (Buffer.isBuffer(r.body) && headers["content-type"].startsWith("image/")) {
    return {
      statusCode: r.status,
      headers,
      body: (r.body as Buffer).toString("base64"),
      isBase64Encoded: true,
    };
  }

  return {
    statusCode: r.status,
    headers,
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
    Object.entries(headers).map(([k, v]) => [
      k,
      Array.isArray(v) ? v.join(",") : v!,
    ])
  );
}
