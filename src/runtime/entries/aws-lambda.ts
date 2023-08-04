import type {
  APIGatewayProxyEvent,
  APIGatewayProxyEventV2,
  APIGatewayProxyResult,
  APIGatewayProxyResultV2,
  Context,
} from "aws-lambda";
import "#internal/nitro/virtual/polyfill";
import { withQuery } from "ufo";
import { nitroApp } from "../app";
import {
  normalizeLambdaIncomingHeaders,
  normalizeLambdaOutgoingBody,
  normalizeLambdaOutgoingHeaders,
} from "../utils.lambda";
import { normalizeCookieHeader } from "../utils";

export async function handler(
  event: APIGatewayProxyEvent,
  context: Context
): Promise<APIGatewayProxyResult>;
export async function handler(
  event: APIGatewayProxyEventV2,
  context: Context
): Promise<APIGatewayProxyResultV2>;
export async function handler(
  event: APIGatewayProxyEvent | APIGatewayProxyEventV2,
  context: Context
): Promise<APIGatewayProxyResult | APIGatewayProxyResultV2> {
  const query = {
    ...event.queryStringParameters,
    ...(event as APIGatewayProxyEvent).multiValueQueryStringParameters,
  };
  const url = withQuery(
    (event as APIGatewayProxyEvent).path ||
      (event as APIGatewayProxyEventV2).rawPath,
    query
  );
  const method =
    (event as APIGatewayProxyEvent).httpMethod ||
    (event as APIGatewayProxyEventV2).requestContext?.http?.method ||
    "get";

  if ("cookies" in event && event.cookies) {
    event.headers.cookie = event.cookies.join(";");
  }

  const r = await nitroApp.localCall({
    event,
    url,
    context,
    headers: normalizeLambdaIncomingHeaders(event.headers),
    method,
    query,
    body: event.body, // TODO: handle event.isBase64Encoded
  });

  // Lambda v2 https://docs.aws.amazon.com/apigateway/latest/developerguide/http-api-develop-integrations-lambda.html#http-api-develop-integrations-lambda.v2
  if ("cookies" in event || "rawPath" in event) {
    const cookies = normalizeCookieHeader(r.headers["set-cookie"]);

    return {
      cookies,
      statusCode: r.status,
      headers: normalizeLambdaOutgoingHeaders(r.headers, true),
      body: normalizeLambdaOutgoingBody(r.body, r.headers),
    };
  }

  return {
    statusCode: r.status,
    headers: normalizeLambdaOutgoingHeaders(r.headers),
    body: normalizeLambdaOutgoingBody(r.body, r.headers),
  };
}
