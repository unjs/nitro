import "#internal/nitro/virtual/polyfill";
import { requestHasBody } from "../utils";
import { nitroApp } from "../app";

/** @see https://developers.cloudflare.com/pages/platform/functions/#writing-your-first-function */
interface CFRequestContext {
  /** same as existing Worker API */
  request: any;
  /** same as existing Worker API */
  env: any;
  /** if filename includes [id] or [[path]] **/
  params: any;
  /** Same as ctx.waitUntil in existing Worker API */
  waitUntil: any;
  /** Used for middleware or to fetch assets */
  next: any;
  /** Arbitrary space for passing data between middlewares */
  data: any;
}

export async function onRequest(ctx: CFRequestContext) {
  try {
    // const asset = await env.ASSETS.fetch(request, { cacheControl: assetsCacheControl })
    if (ctx.request.method === "GET") {
      const asset = await ctx.next();
      if (asset.status !== 404) {
        return asset;
      }
    }
  } catch {
    // Ignore
  }

  const url = new URL(ctx.request.url);
  let body;
  if (requestHasBody(ctx.request)) {
    body = Buffer.from(await ctx.request.arrayBuffer());
  }

  const r = await nitroApp.localCall({
    url: url.pathname + url.search,
    method: ctx.request.method,
    headers: ctx.request.headers,
    host: url.hostname,
    protocol: url.protocol,
    body,
    // TODO: Allow passing custom context
    // cf: ctx,
    // TODO: Handle redirects?
    // redirect: ctx.request.redirect
  });

  return new Response(r.body, {
    // @ts-ignore TODO: Should be HeadersInit instead of string[][]
    headers: normalizeOutgoingHeaders(r.headers),
    status: r.status,
    statusText: r.statusText,
  });
}

function normalizeOutgoingHeaders(
  headers: Record<string, string | string[] | undefined>
) {
  return Object.entries(headers).map(([k, v]) => [
    k,
    Array.isArray(v) ? v.join(",") : v,
  ]);
}
