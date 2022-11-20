import '#internal/nitro/virtual/polyfill'
import { getAssetFromKV, mapRequestToAsset } from '@cloudflare/kv-asset-handler'
import { withoutBase } from 'ufo'
import type { ExecutionContext, RequestInit } from '@cloudflare/workers-types'
import { createCall } from 'unenv/runtime/fetch/index'
import { NodeListener, App, createEvent, createError, isError, sendError, H3EventContext } from 'h3'
import { requestHasBody, useRequestBody } from '../utils'
import { nitroApp } from '../app'
import { useRuntimeConfig } from '#internal/nitro'

// Bundled by Wrangler 2. See https://github.com/cloudflare/kv-asset-handler#asset_manifest-required-for-es-modules
import manifest from '__STATIC_CONTENT_MANIFEST'

export default {
  async fetch(request, env, ctx: ExecutionContext) {
    try {
      // TODO: Update to new API: https://github.com/cloudflare/kv-asset-handler#es-modules
      return await getAssetFromKV({
        request,
        waitUntil(promise) {
          return ctx.waitUntil(promise)
        }
      }, {
        cacheControl: assetsCacheControl,
        mapRequestToAsset: baseURLModifier,
        ASSET_NAMESPACE: env.__STATIC_CONTENT,
        ASSET_MANIFEST: JSON.parse(manifest),
      })
    } catch (_err) {
      // Ignore
    }

    const url = new URL(request.url)
    let body
    if (requestHasBody(request)) {
      body = await useRequestBody(request)
    }

    const localCall = createCall(toNodeListener(nitroApp.h3App, {
      cf: (request as unknown as RequestInit)?.cf,
      env,
      ctx
    }) as any)

    const r = await localCall({
      event: { request },
      url: url.pathname + url.search,
      host: url.hostname,
      protocol: url.protocol,
      headers: Object.fromEntries(request.headers.entries()),
      method: request.method,
      redirect: request.redirect,
      body
    })

    return new Response(r.body, {
      // @ts-ignore TODO: Should be HeadersInit instead of string[][]
      headers: normalizeOutgoingHeaders(r.headers),
      status: r.status,
      statusText: r.statusText
    })
  }
}

function assetsCacheControl(_request) {
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

function normalizeOutgoingHeaders(headers: Record<string, string | string[] | undefined>) {
  return Object.entries(headers).map(([k, v]) => [k, Array.isArray(v) ? v.join(',') : v])
}

function toNodeListener (app: App, context: H3EventContext): NodeListener {
  const toNodeHandle: NodeListener = async function (req, res) {
    const event = createEvent(req, res)
    event.context = { ...event.context, ...context }
    try {
      await app.handler(event)
    } catch (_error: any) {
      const error = createError(_error)
      if (!isError(_error)) {
        error.unhandled = true
      }

      if (app.options.onError) {
        await app.options.onError(error, event)
      } else {
        if (error.unhandled || error.fatal) {
          console.error('[h3]', error.fatal ? '[fatal]' : '[unhandled]', error) // eslint-disable-line no-console
        }
        await sendError(event, error, !!app.options.debug)
      }
    }
  }
  return toNodeHandle
}
