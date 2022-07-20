import type { APIGatewayProxyEvent, APIGatewayProxyEventHeaders, APIGatewayProxyEventV2, APIGatewayProxyResult, APIGatewayProxyResultV2, Context } from 'aws-lambda'
import '#internal/nitro/virtual/polyfill'
import { withQuery } from 'ufo'
import { nitroApp } from '../app'

// Compatibility types that work with AWS v1, AWS v2 & Netlify
type Event = Omit<APIGatewayProxyEvent, 'pathParameters' | 'stageVariables' | 'requestContext' | 'resource'> | Omit<APIGatewayProxyEventV2, 'pathParameters' | 'stageVariables' | 'requestContext' | 'resource'>
type Result = Exclude<APIGatewayProxyResult | APIGatewayProxyResultV2, string> & { statusCode: number }

export const handler = async function handler (event: Event, context: Context): Promise<Result> {
  const url = withQuery((event as APIGatewayProxyEvent).path || (event as APIGatewayProxyEventV2).rawPath, event.queryStringParameters || {})
  const method = (event as APIGatewayProxyEvent).httpMethod || (event as APIGatewayProxyEventV2).requestContext?.http?.method || 'get'

  if ('cookies' in event && event.cookies) {
    event.headers.cookie = event.cookies.join(',')
  }

  const r = await nitroApp.localCall({
    event,
    url,
    context,
    headers: normalizeIncomingHeaders(event.headers),
    method,
    query: event.queryStringParameters,
    body: event.body // TODO: handle event.isBase64Encoded
  })

  const outgoingCookies = r.headers['set-cookie']
  const cookies = Array.isArray(outgoingCookies) ? outgoingCookies : outgoingCookies?.split(',') || []

  return {
    cookies,
    statusCode: r.status,
    headers: normalizeOutgoingHeaders(r.headers),
    body: r.body.toString()
  }
}

function normalizeIncomingHeaders (headers: APIGatewayProxyEventHeaders) {
  return Object.fromEntries(Object.entries(headers).map(([key, value]) => [key.toLowerCase(), value!]))
}

function normalizeOutgoingHeaders (headers: Record<string, string | string[] | undefined>) {
  return Object.fromEntries(Object.entries(headers)
    .filter(([key]) => !['set-cookie'].includes(key))
    .map(([k, v]) => [k, Array.isArray(v) ? v.join(',') : v!]))
}
