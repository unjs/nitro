import type {
  CloudFrontHeaders,
  Context,
  CloudFrontRequest,
  CloudFrontRequestEvent,
  CloudFrontResultResponse,
} from "aws-lambda";
import "#internal/nitro/virtual/polyfill";
import { nitroApp } from "../app";
import { normalizeLambdaOutgoingBody } from "../utils.lambda";

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

  const awsBody = await normalizeLambdaOutgoingBody(r.body, r.headers);
  return {
    status: r.status.toString(),
    headers: normalizeOutgoingHeaders(r.headers),
    body: awsBody.body,
    bodyEncoding: awsBody.type === "binary" ? "base64" : awsBody.type,
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
  headers: Record<string, string | number | string[] | undefined>
): CloudFrontHeaders {
  return Object.fromEntries(
    Object.entries(headers).map(([k, v]) => [
      k,
      Array.isArray(v)
        ? v.flatMap((values) =>
            values.split(",").map((value) => ({ value: value.trim() }))
          )
        : v
            ?.toString()
            .split(",")
            .map((splited) => ({ value: splited.trim() })) ?? [],
    ])
  );
}

function normalizeIncomingBody(body?: CloudFrontRequest["body"]) {
  switch (body?.encoding) {
    case "base64": {
      return Buffer.from(body.data, "base64").toString("utf8");
    }
    case "text": {
      return body.data;
    }
    default: {
      return "";
    }
  }
}
