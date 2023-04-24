import type {
  CloudFrontHeaders,
  Context,
  CloudFrontRequestEvent,
  CloudFrontResultResponse,
} from "aws-lambda";
import "#internal/nitro/virtual/polyfill";
import { nitroApp } from "../app";

export const handler = async function handler(
  event: CloudFrontRequestEvent,
  context: Context
): Promise<CloudFrontResultResponse> {
  const request = event.Records[0].cf.request;
  const url = getFullUrl(request.uri, request.querystring);

  const r = await nitroApp.localCall({
    event,
    url,
    context,
    headers: normalizeIncomingHeaders(request.headers),
    method: request.method,
    query: request.querystring,
    body: normalizeBody(request.body),
  });

  return {
    status: r.status.toString(),
    headers: normalizeOutgoingHeaders(r.headers),
    body: r.body.toString(),
  };
};

function normalizeBody(
  body: CloudFrontRequestEvent["Records"][0]["cf"]["request"]["body"]
) {
  if (typeof body === "undefined") {
    return body;
  }

  const bodyString = body;
  if (typeof body.encoding !== "undefined" && body.encoding === "base64") {
    bodyString.data = Buffer.from(body.data, "base64").toString("utf8");
    bodyString.data = decodeURIComponent(bodyString.data);
  }
  return bodyString;
}

function normalizeIncomingHeaders(headers: CloudFrontHeaders) {
  return Object.fromEntries(
    Object.entries(headers).map(([key, keyValues]) => [
      key,
      keyValues.map((kv) => kv.value),
    ])
  );
}

function normalizeOutgoingHeaders(
  headers: Record<string, string | string[] | undefined>
): CloudFrontHeaders {
  const entries = Object.fromEntries(
    Object.entries(headers).filter(([key]) => !["content-length"].includes(key))
  );

  return Object.fromEntries(
    Object.entries(entries).map(([k, v]) => [
      k,
      Array.isArray(v) ? v.map((value) => ({ value })) : [{ value: v }],
    ])
  );
}

function getFullUrl(uri: string, querystring: string | undefined) {
  return uri + (querystring ? "?" + querystring : "");
}
