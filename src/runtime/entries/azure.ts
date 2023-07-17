import "#internal/nitro/virtual/polyfill";
import { parseURL } from "ufo";
import { nitroApp } from "../app";

export async function handle(context, req) {
  let url: string;
  if (req.headers["x-ms-original-url"]) {
    // This URL has been proxied as there was no static file matching it.
    const parsedURL = parseURL(req.headers["x-ms-original-url"]);
    url = parsedURL.pathname + parsedURL.search;
  } else {
    // Because Azure SWA handles /api/* calls differently they
    // never hit the proxy and we have to reconstitute the URL.
    url = "/api/" + (req.params.url || "");
  }

  const { body, status, statusText, headers } = await nitroApp.localCall({
    url,
    headers: req.headers,
    method: req.method,
    // https://github.com/Azure/azure-functions-host/issues/293
    body: req.rawBody,
  });

  // @todo cookies https://learn.microsoft.com/en-us/azure/azure-functions/functions-reference-node?tabs=typescript%2Cwindows%2Cazure-cli&pivots=nodejs-model-v4#http-response
  context.res = {
    status,
    headers,
    body: body ? body.toString() : statusText,
  };
}
