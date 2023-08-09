import type {
  CloudFrontRequestEvent,
  CloudFrontResultResponse,
  Context,
} from "aws-lambda";
import "#internal/nitro/virtual/polyfill";
import { nitroApp } from "../app";
import {
  normalizeCloudfrontBody,
  normalizeCloudfrontIncomingHeaders,
  normalizeCloudfrontOutgoingHeaders,
  normalizeLambdaOutgoingBody,
} from "../utils.lambda";

export const handler = async function handler(
  event: CloudFrontRequestEvent,
  context: Context
): Promise<CloudFrontResultResponse> {
  const request = event.Records[0].cf.request;

  console.log("Cloudfront Request", request);
  const url = getFullUrl(request.uri, request.querystring);
  const headers = normalizeCloudfrontIncomingHeaders(request.headers);
  const body = normalizeCloudfrontBody(request.body);
  console.log(url, headers, body);
  const r = await nitroApp.localCall({
    event,
    url,
    context,
    headers,
    method: request.method,
    body,
  });
  console.log("Nitro response", r);
  return {
    status: r.status.toString(),
    headers: normalizeCloudfrontOutgoingHeaders(r.headers),
    body: normalizeLambdaOutgoingBody(r.body, r.headers),
  };
};

function getFullUrl(uri: string, queryString?: string) {
  return queryString ? `${uri}?${queryString}` : uri;
}
