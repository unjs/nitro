import "#nitro-internal-pollyfills";
import { useNitroApp } from "nitro/runtime";
import {
  getAzureParsedCookiesFromHeaders,
  normalizeLambdaOutgoingHeaders,
} from "nitro/runtime/internal";

import type { HttpRequest, HttpResponse } from "@azure/functions";

const nitroApp = useNitroApp();

export async function handle(context: { res: HttpResponse }, req: HttpRequest) {
  const url = "/" + (req.params.url || "");

  const { body, status, statusText, headers } = await nitroApp.localCall({
    url,
    headers: req.headers,
    method: req.method || undefined,
    // https://github.com/Azure/azure-functions-host/issues/293
    body: req.rawBody,
  });

  context.res = {
    status,
    // cookies https://learn.microsoft.com/en-us/azure/azure-functions/functions-reference-node?tabs=typescript%2Cwindows%2Cazure-cli&pivots=nodejs-model-v4#http-response
    cookies: getAzureParsedCookiesFromHeaders(headers),
    headers: normalizeLambdaOutgoingHeaders(headers, true),
    body: body ? body.toString() : statusText,
  };
}
