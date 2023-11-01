import type { Readable } from "node:stream";
import type { APIGatewayProxyEventHeaders } from "aws-lambda";
import { toBuffer } from "./utils";

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
  headers: Record<string, number | string | string[] | undefined>,
  stripCookies = false
) {
  const entries = stripCookies
    ? Object.entries(headers).filter(([key]) => !["set-cookie"].includes(key))
    : Object.entries(headers);

  return Object.fromEntries(
    entries.map(([k, v]) => [k, Array.isArray(v) ? v.join(",") : String(v)])
  );
}

// AWS Lambda proxy integrations requires base64 encoded buffers
// binaryMediaTypes should be */*
// see https://docs.aws.amazon.com/apigateway/latest/developerguide/api-gateway-payload-encodings.html
export async function normalizeLambdaOutgoingBody(
  body: BodyInit | ReadableStream | Buffer | Readable | Uint8Array,
  headers: Record<string, number | string | string[] | undefined>
): Promise<{ type: "text" | "binary"; body: string }> {
  if (typeof body === "string") {
    return { type: "text", body };
  }
  if (!body) {
    return { type: "text", body: "" };
  }
  const buffer = await toBuffer(body as any);
  const contentType = (headers["content-type"] as string) || "";
  return isTextType(contentType)
    ? { type: "text", body: buffer.toString("utf8") }
    : { type: "binary", body: buffer.toString("base64") };
}

// -- Internal --

const TEXT_TYPE_RE = /^text\/|\/(javascript|json|xml)|utf-?8/;

function isTextType(contentType = "") {
  return TEXT_TYPE_RE.test(contentType);
}
