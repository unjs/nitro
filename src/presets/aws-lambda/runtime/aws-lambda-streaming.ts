import type {
  APIGatewayProxyEventV2,
  APIGatewayProxyStructuredResultV2,
  Context,
} from "aws-lambda";
import "#nitro-internal-pollyfills";
import { useNitroApp } from "nitropack/runtime";
import {
  normalizeLambdaIncomingHeaders,
  normalizeLambdaOutgoingHeaders,
} from "nitropack/runtime/internal";
import { withQuery } from "ufo";
import { Readable } from "node:stream";

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
      const writer = awslambda.HttpResponseStream.from(
        responseStream,
        httpResponseMetadata
      );

      let reader;
      if (r.body instanceof ReadableStream) {
        reader = r.body.getReader();
      } else if (typeof r.body === 'string') {
        reader = Readable.toWeb(Readable.from(r.body)).getReader();
      } else if (r.body instanceof Uint8Array || r.body instanceof ArrayBuffer) {
        reader = Readable.toWeb(Readable.from(Buffer.from(r.body))).getReader();
      } else if (r.body instanceof Blob) {
        const arrayBuffer = await r.body.arrayBuffer();
        reader = Readable.toWeb(Readable.from(Buffer.from(arrayBuffer))).getReader();
      } else if (r.body instanceof FormData || r.body instanceof URLSearchParams) {
        reader = Readable.toWeb(Readable.from(r.body.toString())).getReader();
      } else {
        reader = Readable.toWeb(Readable.from(JSON.stringify(r.body))).getReader();
      }

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
