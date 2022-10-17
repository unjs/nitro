import '#internal/nitro/virtual/polyfill'
import type { Handler, HandlerResponse, HandlerContext, HandlerEvent } from '@netlify/functions/dist/main'
import type { APIGatewayProxyEventHeaders } from 'aws-lambda'
import { withQuery } from 'ufo'
import { createRouter as createMatcher } from 'radix3'
import { nitroApp } from '../app'
import { useRuntimeConfig } from '../config'

export const handler: Handler = async function handler (event, context) {
  const config = useRuntimeConfig()
  const routerOptions = createMatcher({ routes: config.nitro.routes })

  const query = { ...event.queryStringParameters, ...event.multiValueQueryStringParameters }
  const url = withQuery(event.path, query)
  const routeRules = routerOptions.lookup(url) || {}

  if (routeRules.static || routeRules.swr) {
    const builder = await import('@netlify/functions').then(r => r.builder || r.default.builder)
    const ttl = typeof routeRules.swr === 'number' ? routeRules.swr : 60
    const swrHandler = routeRules.swr
      ? ((event, context) => lambda(event, context).then(r => ({ ...r, ttl }))) as Handler
      : lambda
    return builder(swrHandler)(event, context) as any
  }

  return lambda(event, context)
}

async function lambda (event: HandlerEvent, context: HandlerContext): Promise<HandlerResponse> {
  const query = { ...event.queryStringParameters, ...(event).multiValueQueryStringParameters }
  const url = withQuery((event).path, query)
  const method = (event).httpMethod || 'get'

  const r = await nitroApp.localCall({
    event,
    url,
    context,
    headers: normalizeIncomingHeaders(event.headers),
    method,
    query,
    body: event.body // TODO: handle event.isBase64Encoded
  })

  return {
    statusCode: r.status,
    headers: normalizeOutgoingHeaders(r.headers),
    body: r.body.toString()
  }
}

function normalizeIncomingHeaders (headers?: APIGatewayProxyEventHeaders) {
  return Object.fromEntries(Object.entries(headers || {}).map(([key, value]) => [key.toLowerCase(), value!]))
}

function normalizeOutgoingHeaders (headers: Record<string, string | string[] | undefined>) {
  return Object.fromEntries(Object.entries(headers)
    .filter(([key]) => !['set-cookie'].includes(key))
    .map(([k, v]) => [k, Array.isArray(v) ? v.join(',') : v!]))
}
