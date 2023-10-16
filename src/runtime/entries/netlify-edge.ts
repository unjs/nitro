import "#internal/nitro/virtual/polyfill";
import { nitroApp } from "../app";
import { getNetlifyCacheHeaders } from "../utils.lambda";
import { isPublicAssetURL } from "#internal/nitro/virtual/public-assets";

// https://docs.netlify.com/edge-functions/api/
export default async function (request: Request, _context: any) {
  // TODO type this correctly
  const url = new URL(request.url);

  if (isPublicAssetURL(url.pathname)) {
    return;
  }

  if (!request.headers.has("x-forwarded-proto") && url.protocol === "https:") {
    request.headers.set("x-forwarded-proto", "https");
  }

  const body = request.body ? await request.arrayBuffer() : null;

  // augmenting headers for caching strategies
  const toAdd = getNetlifyCacheHeaders(
    url.toString(),
    Object.fromEntries(request.headers.entries())
  );
  for (const [hKey, hValue] of Object.entries(toAdd)) {
    request.headers.set(hKey, hValue);
  }

  return nitroApp.localFetch(url.pathname + url.search, {
    host: url.hostname,
    protocol: url.protocol,
    headers: request.headers,
    method: request.method,
    redirect: request.redirect,
    body,
  });
}
