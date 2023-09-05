import { resolve } from "pathe";
import { describe } from "vitest";
import destr from "destr";
import type {
  CloudFrontHeaders,
  CloudFrontRequest,
  CloudFrontRequestEvent,
  CloudFrontResultResponse,
} from "aws-lambda";
import { setupTest, testNitro } from "../tests";

describe("nitro:preset:aws-lambda-edge", async () => {
  const ctx = await setupTest("aws-lambda", {
    config: { awsLambda: { target: "edge" } },
  });
  testNitro(ctx, async () => {
    const { handler } = await import(resolve(ctx.outDir, "server/index.mjs"));
    return async ({
      url: incomingUrl,
      headers: incomingHeaders,
      method,
      body,
    }) => {
      const url = new URL(`https://example.com${incomingUrl}`);

      const headers: CloudFrontHeaders = Object.fromEntries(
        Object.entries(incomingHeaders || {}).map(([key, v]) => [
          key,
          Array.isArray(v)
            ? v.map((value) => ({ key, value }))
            : [{ key, value: v }],
        ])
      );

      const request: CloudFrontRequest = {
        clientIp: "203.0.113.178",
        method: method || "GET",
        uri: url.pathname,
        querystring: decodeURIComponent(url.searchParams.toString()).replace(
          /=$|=(?=&)/g,
          ""
        ),
        headers,
        body: {
          action: "read-only" as const,
          encoding: "text" as const,
          data: body,
          inputTruncated: false,
        },
      };
      const event: CloudFrontRequestEvent = {
        Records: [
          {
            cf: {
              config: {
                distributionDomainName: "nitro.cloudfront.net",
                distributionId: "EDFDVBD6EXAMPLE",
                eventType: "origin-request",
                requestId:
                  "4TyzHTaYWb1GX1qTfsHhEqV6HUDd_BzoBZnwfnvQc_1oF26ClkoUSEQ==",
              },
              request,
            },
          },
        ],
      };
      const response: CloudFrontResultResponse = await handler(event);
      const responseHeaders = Object.fromEntries(
        Object.entries(response.headers).map(([key, keyValues]) => [
          key,
          keyValues.map((kv) => kv.value).join(","),
        ])
      );
      return {
        data: destr(response.body),
        status: Number.parseInt(response.status),
        headers: responseHeaders,
      };
    };
  });
});
