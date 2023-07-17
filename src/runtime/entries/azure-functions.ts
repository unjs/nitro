import "#internal/nitro/virtual/polyfill";
import type { HttpRequest, HttpResponse } from "@azure/functions";
import { nitroApp } from "../app";
import {
  getParsedCookiesFromHeaders,
  normalizeOutgoingHeadersLambda,
} from "../utils";

export async function handle(context: { res: HttpResponse }, req: HttpRequest) {
  const url = "/" + (req.params.url || "");

  const { body, status, statusText, headers } = await nitroApp.localCall({
    url,
    headers: req.headers,
    method: req.method,
    // https://github.com/Azure/azure-functions-host/issues/293
    body: req.rawBody,
  });

  context.res = {
    status,
    // cookies https://learn.microsoft.com/en-us/azure/azure-functions/functions-reference-node?tabs=typescript%2Cwindows%2Cazure-cli&pivots=nodejs-model-v4#http-response
    cookies: getParsedCookiesFromHeaders(headers),
    headers: normalizeOutgoingHeadersLambda(headers, true),
    body: body ? body.toString() : statusText,
  };
}
