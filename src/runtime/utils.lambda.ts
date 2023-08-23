import type { Readable } from "node:stream";
import type { APIGatewayProxyEventHeaders } from "aws-lambda";

export function normalizeLambdaIncomingHeaders(
  headers?: APIGatewayProxyEventHeaders
) {
  return Object.fromEntries(
    Object.entries(headers || {}).map(([key, value]) => [
      key.toLowerCase(),
      value,
    ])
  );
}

export function normalizeLambdaOutgoingHeaders(
  headers: Record<string, number | string | string[] | undefined>,
  stripCookies = false
) {
  const entries = stripCookies
    ? Object.entries(headers).filter(([key]) => !["set-cookie"].includes(key))
    : Object.entries(headers);

  return Object.fromEntries(
    entries.map(([k, v]) => [k, Array.isArray(v) ? v.join(",") : String(v)])
  );
}

// AWS Lambda proxy integrations requires base64 encoded buffers
// binaryMediaTypes should be */*
// see https://docs.aws.amazon.com/apigateway/latest/developerguide/api-gateway-payload-encodings.html
export async function normalizeLambdaOutgoingBody(
  body: BodyInit | ReadableStream | Buffer | Readable | Uint8Array,
  headers: Record<string, number | string | string[] | undefined>
): Promise<string> {
  if (typeof body === "string") {
    return body;
  }
  if (!body) {
    return "";
  }
  body = await _toBuffer(body as any);
  if (Buffer.isBuffer(body)) {
    const contentType = (headers["content-type"] as string) || "";
    if (isTextType(contentType)) {
      return body.toString("utf8");
    }
    return body.toString("base64");
  }
  throw new Error(`Unsupported body type: ${typeof body}`);
}

function _toBuffer(data: ReadableStream | Readable | Uint8Array) {
  if ("pipeTo" in data && typeof data.pipeTo === "function") {
    return new Promise<Buffer>((resolve, reject) => {
      const chunks: Buffer[] = [];
      data
        .pipeTo(
          new WritableStream({
            write(chunk) {
              chunks.push(chunk);
            },
            close() {
              resolve(Buffer.concat(chunks));
            },
            abort(reason) {
              reject(reason);
            },
          })
        )
        .catch(reject);
    });
  }
  if ("pipe" in data && typeof data.pipe === "function") {
    return new Promise<Buffer>((resolve, reject) => {
      const chunks: Buffer[] = [];
      data
        .on("data", (chunk: any) => {
          chunks.push(chunk);
        })
        .on("end", () => {
          resolve(Buffer.concat(chunks));
        })
        .on("error", reject);
    });
  }
  return Buffer.from(data as unknown as Uint16Array);
}

// -- Internal --

const TEXT_TYPE_RE = /^text\/|\/(json|xml)|utf-?8/;

function isTextType(contentType = "") {
  return TEXT_TYPE_RE.test(contentType);
}
