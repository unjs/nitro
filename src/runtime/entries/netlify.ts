import '#internal/nitro/virtual/polyfill'
import type { Handler, HandlerResponse, HandlerContext, HandlerEvent } from '@netlify/functions/dist/main'
import type { APIGatewayProxyEventHeaders } from 'aws-lambda'
import { withQuery } from 'ufo'
import { nitroApp } from '../app'
import { getRouteRulesForPath } from '../route-rules'

export const handler: Handler = async function handler (event, context) {
  const query = { ...event.queryStringParameters, ...event.multiValueQueryStringParameters }
  const url = withQuery(event.path, query)
  const routeRules = getRouteRulesForPath(url)

  if (routeRules.cache && (routeRules.cache.swr || routeRules.cache.static)) {
    const builder = await import('@netlify/functions').then(r => r.builder || r.default.builder)
    const ttl = typeof routeRules.cache.swr === 'number' ? routeRules.cache.swr : 60
    const swrHandler = routeRules.cache.swr
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
