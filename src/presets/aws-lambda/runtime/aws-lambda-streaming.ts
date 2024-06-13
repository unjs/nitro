import type {
  APIGatewayProxyEventV2,
  Context,
  APIGatewayProxyStructuredResultV2,
} from "aws-lambda";
import "#nitro-internal-pollyfills";
import { withQuery } from "ufo";
import { useNitroApp } from "nitropack/runtime";
import {
  normalizeLambdaIncomingHeaders,
  normalizeLambdaOutgoingHeaders,
} from "nitropack/runtime/internal";

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

const nitroApp = useNitroApp();

export const handler = awslambda.streamifyResponse(
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
