import "#internal/nitro/virtual/polyfill";
import { nitroApp } from "#internal/nitro/app";

import { normalizeLambdaOutgoingHeaders } from "#internal/nitro/utils.lambda";
import { normalizeAzureFunctionIncomingHeaders } from "#internal/nitro/utils.azure";

import { app } from "@azure/functions";

import type { HttpRequest } from "@azure/functions";

function getPathFromUrl(urlString: string): string {
  try {
    const url = new URL(urlString);
    return url.pathname;
  } catch {
    return "/";
  }
}

app.http("nitro-server", {
  route: "{*path}",
  methods: ["GET", "POST", "PUT", "PATCH", "HEAD", "OPTIONS", "DELETE"],
  handler: async (request: HttpRequest) => {
    const url = getPathFromUrl(request.url);

    const { body, status, headers } = await nitroApp.localCall({
      url,
      headers: normalizeAzureFunctionIncomingHeaders(request) as Record<
        string,
        string | string[]
      >,
      method: request.method || undefined,
      body: request.body,
    });

    return {
      body: body as any,
      headers: normalizeLambdaOutgoingHeaders(headers),
      status,
    };
  },
});
