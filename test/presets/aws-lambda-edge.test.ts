import { resolve } from "pathe";
import { describe } from "vitest";
import destr from "destr";
import type {
  CloudFrontHeaders,
  CloudFrontRequestEvent,
  CloudFrontResultResponse,
} from "aws-lambda";
import { setupTest, testNitro } from "../tests";

describe("nitro:preset:aws-lambda-edge", async () => {
  const ctx = await setupTest("aws-lambda-edge");
  testNitro(ctx, async () => {
    const { handler } = await import(resolve(ctx.outDir, "server/index.mjs"));
    return async ({ url: rawRelativeUrl, headers, method, body }) => {
      // creating new URL object to parse query easier
      const [uri, querystring] = rawRelativeUrl.split("?");
      // modify headers to CloudFrontHeaders.
      const reqHeaders: CloudFrontHeaders = Object.fromEntries(
        Object.entries(headers || {}).map(([k, v]) => [
          k,
          Array.isArray(v) ? v.map((value) => ({ value })) : [{ value: v }],
        ])
      );

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
              request: {
                clientIp: "203.0.113.178",
                method: method || "GET",
                uri,
                querystring,
                headers: reqHeaders,
                body: body
                  ? {
                      action: "read-only",
                      data: body,
                      encoding: "text",
                      inputTruncated: false,
                    }
                  : undefined,
              },
            },
          },
        ],
      };
      const res: CloudFrontResultResponse = await handler(event);
      // The headers that CloudFront responds to are in array format, so normalise them to the string format expected by testNitro.
      const resHeaders = Object.fromEntries(
        Object.entries(res.headers).map(([key, keyValues]) => [
          key,
          keyValues.length === 1
            ? keyValues[0].value
            : keyValues.map((kv) => kv.value),
        ])
      );

      return {
        data: destr(res.body),
        status: Number.parseInt(res.status),
        headers: resHeaders,
      };
    };
  });
});
