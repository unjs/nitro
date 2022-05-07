import '#internal/nitro/virtual/polyfill'
import { requestHasBody, useRequestBody } from '../utils'
import { nitroApp } from '../app'

export default {
  async fetch (request, env, context) {
    return await handleEvent(request, env, context)
  }
}
async function handleEvent (request, env, context) {
  try {
    const asset = await env.ASSETS.fetch(request, { cacheControl: assetsCacheControl })
    if (asset.status !== 404) {
      return asset
    }
  } catch (_err) {
    // Ignore
  }

  const url = new URL(request.url)
  let body
  if (requestHasBody(request)) {
    body = await useRequestBody(request)
  }

  const r = await nitroApp.localCall({
    env,
    context,
    url: url.pathname + url.search,
    host: url.hostname,
    protocol: url.protocol,
    headers: request.headers,
    method: request.method,
    redirect: request.redirect,
    body
  })
  return new Response(r.body, {
    headers: normalizeOutgoingHeaders(r.headers),
    status: r.status,
    statusText: r.statusText
  })
}

function assetsCacheControl (_request) {
  return {}
}

function normalizeOutgoingHeaders (headers: Record<string, string | string[] | undefined>) {
  return Object.entries(headers).map(([k, v]) => [k, Array.isArray(v) ? v.join(',') : v])
}
