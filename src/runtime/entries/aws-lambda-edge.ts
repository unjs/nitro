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
  const url = request.uri + "?" + request.querystring;

  const r = await nitroApp.localCall({
    event,
    url,
    context,
    headers: normalizeIncomingHeaders(request.headers),
    method: request.method,
    query: request.querystring,
    body: request.body,
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
      Array.isArray(v) ? v.map((value) => ({ value })) : [{ value: v }],
    ])
  );
}
