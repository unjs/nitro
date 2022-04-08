import '#nitro/virtual/polyfill'
import { getAssetFromKV, mapRequestToAsset } from '@cloudflare/kv-asset-handler'
import { withoutBase } from 'ufo'
import { requestHasBody, useRequestBody } from '../utils'
import { nitroApp } from '../app'
import { useRuntimeConfig } from '#nitro'

addEventListener('fetch', (event: any) => {
  event.respondWith(handleEvent(event))
})

async function handleEvent (event) {
  try {
    return await getAssetFromKV(event, { cacheControl: assetsCacheControl, mapRequestToAsset: baseURLModifier })
  } catch (_err) {
    // Ignore
  }

  const url = new URL(event.request.url)
  let body
  if (requestHasBody(event.request)) {
    body = await useRequestBody(event.request)
  }

  const r = await nitroApp.localCall({
    event,
    url: url.pathname + url.search,
    host: url.hostname,
    protocol: url.protocol,
    headers: event.request.headers,
    method: event.request.method,
    redirect: event.request.redirect,
    body
  })

  return new Response(r.body, {
    // @ts-ignore
    headers: r.headers,
    status: r.status,
    statusText: r.statusText
  })
}

function assetsCacheControl (_request) {
  // TODO: Detect public asset bases
  // if (request.url.startsWith(buildAssetsURL())) {
  //   return {
  //     browserTTL: 31536000,
  //     edgeTTL: 31536000
  //   }
  // }
  return {}
}

const baseURLModifier = (request: Request) => {
  const url = withoutBase(request.url, useRuntimeConfig().app.baseURL)
  return mapRequestToAsset(new Request(url, request))
}
