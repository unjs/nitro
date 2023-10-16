import type { Readable } from "node:stream";
import type { APIGatewayProxyEventHeaders } from "aws-lambda";
import { getRouteRulesForPath } from "./route-rules";
import type { NitroApp } from "./app";

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
  const buffer = await _toBuffer(body as any);
  const contentType = (headers["content-type"] as string) || "";
  return isTextType(contentType)
    ? { type: "text", body: buffer.toString("utf8") }
    : { type: "binary", body: buffer.toString("base64") };
}

function _toBuffer(data: ReadableStream | Readable | Uint8Array) {
  if ("pipeTo" in data && typeof data.pipeTo === "function") {
    return new Promise<Buffer>((resolve, reject) => {
      const chunks: Buffer[] = [];
      data
        .pipeTo(
          new WritableStream({
            write(chunk) {
              chunks.push(chunk);
            },
            close() {
              resolve(Buffer.concat(chunks));
            },
            abort(reason) {
              reject(reason);
            },
          })
        )
        .catch(reject);
    });
  }
  if ("pipe" in data && typeof data.pipe === "function") {
    return new Promise<Buffer>((resolve, reject) => {
      const chunks: Buffer[] = [];
      data
        .on("data", (chunk: any) => {
          chunks.push(chunk);
        })
        .on("end", () => {
          resolve(Buffer.concat(chunks));
        })
        .on("error", reject);
    });
  }
  return Buffer.from(data as unknown as Uint16Array);
}

// -- Internal --

const TEXT_TYPE_RE = /^text\/|\/(javascript|json|xml)|utf-?8/;

function isTextType(contentType = "") {
  return TEXT_TYPE_RE.test(contentType);
}

// -- Netlify headers utils

type _THeaders = Record<string, string | number | string[]>;
export const getNetlifyCacheHeaders = (url: string, currHeaders: _THeaders) => {
  const routeRules = getRouteRulesForPath(url);
  const headersToAdd: Partial<
    Record<"Cache-Control" | "Netlify-CDN-Cache-Control", string>
  > = {};
  if (
    routeRules.isr &&
    !Object.keys(currHeaders)
      .map((hKey) => hKey.toLowerCase())
      .includes("cache-control")
  ) {
    headersToAdd["Cache-Control"] = "public, max-age=0, must-revalidate";
    headersToAdd["Netlify-CDN-Cache-Control"] =
      typeof routeRules.isr === "number"
        ? `public, max-age=${routeRules.isr}, must-revalidate`
        : `public, max-age=0, stale-while-revalidate=31536000`;
  }

  return headersToAdd;
};
