import { eventHandler, H3Event, sendRedirect, setHeaders } from 'h3'
import { createRouter as createRadixRouter, toRouteMatcher } from 'radix3'
import { NitroRouteOptions } from '../types'
import { useRuntimeConfig } from './config'

const config = useRuntimeConfig()
const _routeOptionsMatcher = toRouteMatcher(createRadixRouter({ routes: config.nitro.routes }))

export function createRouteOptionsHandler () {
  return eventHandler((event) => {
    // Match route options against path
    const routeOptions = getRouteOptions(event)

    // Apply CORS options
    if (routeOptions.cors) {
      setHeaders(event, {
        'access-control-allow-origin': '*',
        'access-control-allowed-methods': '*',
        'access-control-allow-headers': '*',
        'access-control-max-age': '0'
      })
    }

    // Apply headers options
    if (routeOptions.headers) {
      setHeaders(event, routeOptions.headers)
    }
    // Apply redirect options
    if (routeOptions.redirect) {
      if (typeof routeOptions.redirect === 'string') {
        routeOptions.redirect = { to: routeOptions.redirect }
      }
      return sendRedirect(event, routeOptions.redirect.to, routeOptions.redirect.statusCode || 307)
    }
  })
}

export function getRouteOptions (event: H3Event) {
  event.context._nitro = event.context._nitro || {}
  if (!event.context._nitro.routeOptions) {
    const path = new URL(event.req.url, 'http://localhost').pathname
    event.context._nitro.routeOptions = getRouteOptionsForPath(path)
  }
  return event.context._nitro.routeOptions
}

export function getRouteOptionsForPath (path: string) {
  const routeOptions: NitroRouteOptions = {}
  for (const rule of _routeOptionsMatcher.matchAll(path)) {
    Object.assign(routeOptions, rule)
  }
  return routeOptions
}
