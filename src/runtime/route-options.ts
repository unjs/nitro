import { eventHandler, H3Event, sendRedirect, setHeaders } from 'h3'
import defu from 'defu'
import { createRouter as createRadixRouter, toRouteMatcher } from 'radix3'
import { useRuntimeConfig } from './config'
import type { NitroRouteOptions } from 'nitropack'

const config = useRuntimeConfig()
const _routeOptionsMatcher = toRouteMatcher(createRadixRouter({ routes: config.nitro.routes }))

export function createRouteOptionsHandler () {
  return eventHandler((event) => {
    // Match route options against path
    const routeOptions = getRouteOptions(event)
    // Apply headers options
    if (routeOptions.headers) {
      setHeaders(event, routeOptions.headers)
    }
    // Apply redirect options
    if (routeOptions.redirect) {
      return sendRedirect(event, routeOptions.redirect.to, routeOptions.redirect.statusCode)
    }
  })
}

export function getRouteOptions (event: H3Event): NitroRouteOptions {
  event.context._nitro = event.context._nitro || {}
  if (!event.context._nitro.routeOptions) {
    const path = new URL(event.req.url, 'http://localhost').pathname
    event.context._nitro.routeOptions = getRouteOptionsForPath(path)
  }
  return event.context._nitro.routeOptions
}

export function getRouteOptionsForPath (path: string): NitroRouteOptions {
  return defu({}, ..._routeOptionsMatcher.matchAll(path).reverse())
}
