import type {
  APIGatewayProxyEvent,
  APIGatewayProxyEventV2,
  APIGatewayProxyResult,
  APIGatewayProxyResultV2,
  Context,
} from "aws-lambda";
import "#nitro-internal-pollyfills";
import { useNitroApp } from "nitropack/runtime";
import {
  normalizeCookieHeader,
  normalizeLambdaIncomingHeaders,
  normalizeLambdaOutgoingBody,
  normalizeLambdaOutgoingHeaders,
} from "nitropack/runtime/internal";
import { withQuery } from "ufo";
import { useRuntimeConfig } from "nitro/runtime/index";

const nitroApp = useNitroApp();

export async function bufferedHandler(
  event: APIGatewayProxyEvent,
  context: Context
): Promise<APIGatewayProxyResult>;
export async function bufferedHandler(
  event: APIGatewayProxyEventV2,
  context: Context
): Promise<APIGatewayProxyResultV2>;
export async function bufferedHandler(
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
    headers: normalizeLambdaIncomingHeaders(event.headers) as Record<
      string,
      string | string[]
    >,
    method,
    query,
    body: event.isBase64Encoded
      ? Buffer.from(event.body || "", "base64").toString("utf8")
      : event.body,
  });

  // ApiGateway v2 https://docs.aws.amazon.com/apigateway/latest/developerguide/http-api-develop-integrations-lambda.html#http-api-develop-integrations-lambda.v2
  const isApiGwV2 = "cookies" in event || "rawPath" in event;
  const awsBody = await normalizeLambdaOutgoingBody(r.body, r.headers);
  const cookies = normalizeCookieHeader(r.headers["set-cookie"]);
  return {
    ...(cookies.length > 0 && {
      ...(isApiGwV2
        ? { cookies }
        : { multiValueHeaders: { "set-cookie": cookies } }),
    }),
    statusCode: r.status,
    headers: normalizeLambdaOutgoingHeaders(r.headers, true),
    body: awsBody.body,
    isBase64Encoded: awsBody.type === "binary",
  };
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace awslambda {
    // https://docs.aws.amazon.com/lambda/latest/dg/configuration-response-streaming.html
    function streamifyResponse(
      handler: (
        event: APIGatewayProxyEventV2,
        responseStream: NodeJS.WritableStream,
        context: Context
      ) => Promise<void>
    ): any;

    // eslint-disable-next-line @typescript-eslint/no-namespace
    namespace HttpResponseStream {
      function from(
        stream: NodeJS.WritableStream,
        metadata: {
          statusCode: APIGatewayProxyStructuredResultV2["statusCode"];
          headers: APIGatewayProxyStructuredResultV2["headers"];
        }
      ): NodeJS.WritableStream;
    }
  }
}

const streamingHandler = awslambda.streamifyResponse(
  async (event: APIGatewayProxyEventV2, responseStream, context) => {
    const query = {
      ...event.queryStringParameters,
    };
    const url = withQuery(event.rawPath, query);
    const method = event.requestContext?.http?.method || "get";

    if ("cookies" in event && event.cookies) {
      event.headers.cookie = event.cookies.join(";");
    }

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
        ? Buffer.from(event.body || "", "base64").toString("utf8")
        : event.body,
    });
    const httpResponseMetadata = {
      statusCode: r.status,
      headers: {
        ...normalizeLambdaOutgoingHeaders(r.headers, true),
        "Transfer-Encoding": "chunked",
      },
    };
    if (r.body) {
      const reader = r.body as ReadableStream;
      const writer = awslambda.HttpResponseStream.from(
        responseStream,
        httpResponseMetadata
      );
      await streamToNodeStream(reader.getReader(), responseStream);
      writer.end();
    }
  }
);

const streamToNodeStream = async (
  reader: ReadableStreamDefaultReader<Uint8Array>,
  writer: NodeJS.WritableStream
) => {
  let readResult = await reader.read();
  while (!readResult.done) {
    writer.write(readResult.value);
    readResult = await reader.read();
  }
  writer.end();
};

export const handler = useRuntimeConfig().streaming
  ? streamingHandler
  : bufferedHandler;
