import "#internal/nitro/virtual/polyfill";
import { nitroApp } from "../app";
import { defineNitroResponse } from "../utils";

export async function handle(context, req) {
  const url = "/" + (req.params.url || "");

  const response = await nitroApp.localCall({
    url,
    headers: req.headers,
    method: req.method,
    // https://github.com/Azure/azure-functions-host/issues/293
    body: req.rawBody,
  });
  const { body, status, statusText, headers } = await defineNitroResponse(
    nitroApp,
    response
  );
  context.res = {
    status,
    headers,
    body: body ? body.toString() : statusText,
  };
}
