import { App as H3App, createApp, createRouter, eventHandler, H3Event, lazyEventHandler, Router, sendRedirect, setHeaders, toNodeListener } from 'h3'
import { createFetch, Headers } from 'ohmyfetch'
import destr from 'destr'
import { createRouter as createRadixRouter, toRouteMatcher } from 'radix3'
import { createCall, createFetch as createLocalFetch } from 'unenv/runtime/fetch/index'
import { createHooks, Hookable } from 'hookable'
import { NitroRouteOptions } from '../types'
import { useRuntimeConfig } from './config'
import { timingMiddleware } from './timing'
import { cachedEventHandler } from './cache'
import { plugins } from '#internal/nitro/virtual/plugins'
import errorHandler from '#internal/nitro/virtual/error-handler'
import { handlers } from '#internal/nitro/virtual/server-handlers'

export interface NitroApp {
  h3App: H3App
  router: Router
  // TODO: Type hooks and allow extending
  hooks: Hookable
  localCall: ReturnType<typeof createCall>
  localFetch: ReturnType<typeof createLocalFetch>
}

function createNitroApp (): NitroApp {
  const config = useRuntimeConfig()

  const hooks = createHooks()

  const h3App = createApp({
    debug: destr(process.env.DEBUG),
    onError: errorHandler
  })

  h3App.use(config.app.baseURL, timingMiddleware)

  const router = createRouter()

  const _routeOptionsMatcher = toRouteMatcher(createRadixRouter({ routes: config.nitro.routes }))
  const getRouteOptionsForPath = (path: string) => {
    const routeOptions: NitroRouteOptions = {}
    for (const rule of _routeOptionsMatcher.matchAll(path)) {
      Object.assign(routeOptions, rule)
    }
    return routeOptions
  }
  const getRouteOptions = (event: H3Event) => {
    event.context._nitro = event.context._nitro || {}
    if (!event.context._nitro.routeOptions) {
      const path = new URL(event.req.url, 'http://localhost').pathname
      event.context._nitro.routeOptions = getRouteOptionsForPath(path)
    }
    return event.context._nitro.routeOptions
  }

  // Apply route options to all requests
  h3App.use(eventHandler((event) => {
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
  }))

  for (const h of handlers) {
    let handler = h.lazy ? lazyEventHandler(h.handler) : h.handler

    // Apply SWR route options to matching handlers
    const routeOptions = getRouteOptionsForPath(h.route.replace(/:\w+|\*\*/g, '_'))
    if (routeOptions.swr) {
      handler = cachedEventHandler(handler, {
        group: 'nitro/routes'
      })
    }

    if (h.middleware || !h.route) {
      const middlewareBase = (config.app.baseURL + (h.route || '/')).replace(/\/+/g, '/')
      h3App.use(middlewareBase, handler)
    } else {
      router.use(h.route, handler, h.method)
    }
  }

  h3App.use(config.app.baseURL, router)

  const localCall = createCall(toNodeListener(h3App) as any)
  const localFetch = createLocalFetch(localCall, globalThis.fetch)

  const $fetch = createFetch({ fetch: localFetch, Headers, defaults: { baseURL: config.app.baseURL } })
  // @ts-ignore
  globalThis.$fetch = $fetch

  const app: NitroApp = {
    hooks,
    h3App,
    router,
    localCall,
    localFetch
  }

  for (const plugin of plugins) {
    plugin(app)
  }

  return app
}

export const nitroApp: NitroApp = createNitroApp()

export const useNitroApp = () => nitroApp
