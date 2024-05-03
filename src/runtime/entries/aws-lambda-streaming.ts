import type {
  APIGatewayProxyEventV2,
  Context,
  APIGatewayProxyStructuredResultV2,
} from "aws-lambda";
import "#internal/nitro/virtual/polyfill";
import { withQuery } from "ufo";
import { nitroApp } from "../app";
import {
  normalizeLambdaIncomingHeaders,
  normalizeLambdaOutgoingHeaders,
} from "../utils.lambda";
import { pipeline, Readable } from "node:stream";

declare global {
  namespace awslambda2 {
    function streamifyResponse(
      handler: (
        event: APIGatewayProxyEventV2,
        responseStream: NodeJS.WritableStream,
        context: Context
      ) => Promise<void>
    );
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
export const handler = awslambda2.streamifyResponse(
  async (event, responseStream, context) => {
    const query = {
      ...event.queryStringParameters,
    };
    const url = withQuery(event.rawPath, query);
    const method =
      (event as APIGatewayProxyEventV2).requestContext?.http?.method || "get";

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
      body: event.isBase64Encoded
        ? Buffer.from(event.body, "base64").toString("utf8")
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
