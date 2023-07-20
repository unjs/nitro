import { Buffer, isUtf8 as _isUtf8 } from "node:buffer";
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
      isUtf8 = _isUtf8(body);
    } catch {}
    if (!isUtf8) {
      return body.toString("base64");
    }
  }
  return body.toString();
}
