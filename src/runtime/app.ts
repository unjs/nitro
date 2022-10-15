import { App as H3App, createApp, createRouter, lazyEventHandler, Router, toNodeListener } from 'h3'
import { createFetch, Headers } from 'ohmyfetch'
import destr from 'destr'
import { createCall, createFetch as createLocalFetch } from 'unenv/runtime/fetch/index'
import { createHooks, Hookable } from 'hookable'
import { useRuntimeConfig } from './config'
import { timingMiddleware } from './timing'
import { cachedEventHandler } from './cache'
import { createRouteOptionsHandler, getRouteOptionsForPath } from './route-options'
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

  h3App.use(createRouteOptionsHandler())

  for (const h of handlers) {
    let handler = h.lazy ? lazyEventHandler(h.handler) : h.handler

    // Wrap matching handlers for caching route options
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
