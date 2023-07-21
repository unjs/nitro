import NodeBuffer, { Buffer } from "node:buffer";
import type { APIGatewayProxyEventHeaders } from "aws-lambda";
import type { HeadersObject } from "unenv/runtime/_internal/types";

export function normalizeLambdaIncomingHeaders(
  headers?: APIGatewayProxyEventHeaders
) {
  return Object.fromEntries(
    Object.entries(headers || {}).map(([key, value]) => [
      key.toLowerCase(),
      value,
    ])
  );
}

export function normalizeLambdaOutgoingHeaders(
  headers: HeadersObject,
  stripCookies = false
) {
  const entries = stripCookies
    ? Object.entries(headers).filter(([key]) => !["set-cookie"].includes(key))
    : Object.entries(headers);

  return Object.fromEntries(
    entries.map(([k, v]) => [k, Array.isArray(v) ? v.join(",") : v])
  );
}

// AWS Lambda proxy integrations requires base64 encoded buffers
// binaryMediaTypes should be */*
// see https://docs.aws.amazon.com/apigateway/latest/developerguide/api-gateway-payload-encodings.html
export function normalizeLambdaOutgoingBody(
  body: BodyInit,
  headers: HeadersObject
): string {
  if (typeof body === "string") {
    return body;
  }
  if (!body) {
    return "";
  }
  if (Buffer.isBuffer(body)) {
    const contentType = (headers["content-type"] as string) || "";
    if (isTextType(contentType)) {
      return body.toString("utf8");
    }
    return body.toString("base64");
  }
  throw new Error(`Unsupported body type: ${typeof body}`);
}

function isTextType(contentType: string) {
  return contentType.includes("text/") || contentType.includes("json");
}
