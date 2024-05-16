import "#internal/nitro/virtual/polyfill";
import { nitroApp } from "#internal/nitro/app";
import { normalizeCookieHeader } from "#internal/nitro/utils";
import {
  normalizeLambdaIncomingHeaders,
  normalizeLambdaOutgoingBody,
  normalizeLambdaOutgoingHeaders,
} from "#internal/nitro/utils.lambda";

import { withQuery } from "ufo";
import type {
  HandlerResponse,
  HandlerContext,
  HandlerEvent,
} from "@netlify/functions";

// Netlify functions uses lambda v1 https://docs.aws.amazon.com/apigateway/latest/developerguide/http-api-develop-integrations-lambda.html#http-api-develop-integrations-lambda.v2
export async function lambda(
  event: HandlerEvent,
  context: HandlerContext
): Promise<HandlerResponse> {
  const query = {
    ...event.queryStringParameters,
    ...event.multiValueQueryStringParameters,
  };
  const url = withQuery(event.path, query);
  const method = event.httpMethod || "get";

  const r = await nitroApp.localCall({
    event,
    url,
    context,
    headers: normalizeLambdaIncomingHeaders(event.headers) as Record<
      string,
      string | string[]
    >,
    method,
    query,
    body: event.isBase64Encoded
      ? Buffer.from(event.body || "", "base64")
      : event.body,
  });

  const cookies = normalizeCookieHeader(String(r.headers["set-cookie"]));
  const awsBody = await normalizeLambdaOutgoingBody(r.body, r.headers);

  return {
    statusCode: r.status,
    headers: normalizeLambdaOutgoingHeaders(r.headers, true),
    body: awsBody.body,
    isBase64Encoded: awsBody.type === "binary",
    ...(cookies.length > 0 && {
      multiValueHeaders: { "set-cookie": cookies },
    }),
  };
}
