import type {
  CloudFrontHeaders,
  Context,
  CloudFrontRequest,
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

  const r = await nitroApp.localCall({
    event,
    url: request.uri + (request.querystring ? `?${request.querystring}` : ""),
    context,
    headers: normalizeIncomingHeaders(request.headers),
    method: request.method,
    query: request.querystring,
    body: normalizeIncomingBody(request.body),
  });

  return {
    status: r.status.toString(),
    headers: normalizeOutgoingHeaders(r.headers),
    body: r.body.toString(),
  };
};

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
  return Object.fromEntries(
    Object.entries(headers).map(([k, v]) => [
      k,
      Array.isArray(v) ? v.map((value) => ({ value })) : [{ value: v ?? "" }],
    ])
  );
}

function normalizeIncomingBody(body?: CloudFrontRequest["body"]) {
  switch (body?.encoding) {
    case "base64":
      return Buffer.from(body.data, "base64");
    case "text":
      return body.data;
    default:
      return "";
  }
}
