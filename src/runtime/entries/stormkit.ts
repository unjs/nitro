import type { ALBHandler } from 'aws-lambda'
import '#internal/nitro/virtual/polyfill'
import { withQuery } from 'ufo'
import { nitroApp } from '../app'

export const handler: ALBHandler = async function handler (event, context) {
  const url = withQuery(event.path, event.queryStringParameters || {})
  const method = event.httpMethod || 'get'

  const r = await nitroApp.localCall({
    event,
    url,
    context,
    headers: event.headers,
    method,
    query: event.queryStringParameters,
    body: event.body
  })

  return {
    statusCode: r.status,
    headers: normalizeOutgoingHeaders(r.headers),
    body: r.body.toString()
  }
}

function normalizeOutgoingHeaders (headers: Record<string, string | string[] | undefined>) {
  return Object.fromEntries(Object.entries(headers).map(([k, v]) => [k, Array.isArray(v) ? v.join(',') : v!]))
}
