import { App as H3App, createApp, createRouter, lazyEventHandler } from 'h3'
import { createFetch, Headers } from 'ohmyfetch'
import destr from 'destr'
import { createRouter as createMatcher } from 'radix3'
import { createCall, createFetch as createLocalFetch } from 'unenv/runtime/fetch/index'
import { createHooks, Hookable } from 'hookable'
import { useRuntimeConfig } from './config'
import { timingMiddleware } from './timing'
import { cachedEventHandler } from './cache'
import { plugins } from '#nitro/virtual/plugins'
import errorHandler from '#nitro/virtual/error-handler'
import { handlers } from '#nitro/virtual/server-handlers'

export interface NitroApp {
  h3App: H3App
  hooks: Hookable,
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

  const routerOptions = createMatcher({ routes: config.nitro.routes })

  for (const h of handlers) {
    let handler = h.lazy ? lazyEventHandler(h.handler as any) : h.handler

    const referenceRoute = h.route.replace(/:\w+|\*\*/g, '_')
    const routeOptions = routerOptions.lookup(referenceRoute) || {}
    if (routeOptions.swr) {
      handler = cachedEventHandler(handler, {
        group: 'nitro/routes'
      })
    }

    if (h.route === '') {
      h3App.use(config.app.baseURL, handler)
    } else {
      router.use(h.route, handler, h.method)
    }
  }

  h3App.use(config.app.baseURL, router)

  const localCall = createCall(h3App.nodeHandler as any)
  const localFetch = createLocalFetch(localCall, globalThis.fetch)

  const $fetch = createFetch({ fetch: localFetch, Headers })
  // @ts-ignore
  globalThis.$fetch = $fetch

  const app: NitroApp = {
    hooks,
    h3App,
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
