import '#internal/nitro/virtual/polyfill'

import type { APIGatewayProxyEvent, APIGatewayProxyEventV2, APIGatewayProxyResult, APIGatewayProxyResultV2, Context } from 'aws-lambda'
import { withQuery } from 'ufo'
import { createRouter as createMatcher } from 'radix3'

import { useRuntimeConfig } from '../config'

import { handler as _handler } from '#internal/nitro/entries/aws-lambda'

// Compatibility types that work with AWS v1, AWS v2 & Netlify
type Event = Omit<APIGatewayProxyEvent, 'pathParameters' | 'stageVariables' | 'requestContext' | 'resource'> | Omit<APIGatewayProxyEventV2, 'pathParameters' | 'stageVariables' | 'requestContext' | 'resource'>
type Result = Exclude<APIGatewayProxyResult | APIGatewayProxyResultV2, string> & {
  statusCode: number,
  ttl?: number
}

export const handler = async function handler (event: Event, context: Context): Promise<Result> {
  const config = useRuntimeConfig()
  const routerOptions = createMatcher({ routes: config.nitro.routes })

  const query = { ...event.queryStringParameters, ...(event as APIGatewayProxyEvent).multiValueQueryStringParameters }
  const url = withQuery((event as APIGatewayProxyEvent).path || (event as APIGatewayProxyEventV2).rawPath, query)
  const routeOptions = routerOptions.lookup(url) || {}

  if (routeOptions.swr) {
    const builder = await import('@netlify/functions').then(r => r.builder || r.default.builder)
    const ttl = typeof routeOptions.swr === 'number' ? routeOptions.swr : 60
    return Promise.resolve(builder(_handler)(event as any, context))
      .then(r => routeOptions.swr ? ({ ttl, ...r }) : r) as Promise<Result>
  }

  return _handler(event, context)
}
