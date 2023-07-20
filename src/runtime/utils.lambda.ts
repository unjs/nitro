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

export function normalizeLambdaOutgoingBody(body: BodyInit) {
  // AWS Lambda proxy integrations requires base64 encoded buffers
  // binaryMediaTypes should be */*
  // see https://docs.aws.amazon.com/apigateway/latest/developerguide/api-gateway-payload-encodings.html
  if (Buffer.isBuffer(body)) {
    let isUtf8 = false;
    try {
      // not supported in Node <= 16.x
      isUtf8 = NodeBuffer.isUtf8(body);
    } catch {
      // hacky fallback option for determining if buffer is utf8
      isUtf8 = body.toString().length === body.length;
    }
    if (!isUtf8) {
      return body.toString("base64");
    }
  }
  return body.toString();
}
