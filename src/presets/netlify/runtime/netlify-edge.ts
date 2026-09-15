import "#nitro/virtual/polyfills";
import { useNitroApp } from "nitro/app";
import { withServerEntryOptions } from "#nitro/runtime/serve";
import { isPublicAssetURL } from "#nitro/virtual/public-assets";
import type { Context } from "@netlify/edge-functions";
import type { ServerRequest } from "srvx";

const fetchHandler = withServerEntryOptions(useNitroApp().fetch);

// https://docs.netlify.com/edge-functions/api/
export default async function netlifyEdge(netlifyReq: Request, context: Context) {
  // srvx compatibility
  const req = netlifyReq as unknown as ServerRequest;
  req.ip = context.ip;
  req.runtime ??= { name: "netlify-edge" };
  req.runtime.netlify ??= { context } as any;

  const url = new URL(req.url);

  if (isPublicAssetURL(url.pathname)) {
    return;
  }

  if (!req.headers.has("x-forwarded-proto") && url.protocol === "https:") {
    req.headers.set("x-forwarded-proto", "https");
  }

  return fetchHandler(req);
}
