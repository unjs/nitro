import { createApp, createRouter, lazyEventHandler } from 'h3'
import { createFetch, Headers } from 'ohmyfetch'
import destr from 'destr'
import { createRouter as createMatcher } from 'radix3'
import { createCall, createFetch as createLocalFetch } from 'unenv/runtime/fetch/index'
import { config } from './config'
import { timingMiddleware } from './timing'
import { cachedEventHandler } from './cache'
import handleError from '#nitro/error'
import { handlers } from '#nitro/virtual/server-handlers'

export const app = createApp({
  debug: destr(process.env.DEBUG),
  onError: handleError
})

app.use(timingMiddleware)

const router = createRouter()

const routerOptions = createMatcher({ routes: config.app.routes })

for (const h of handlers) {
  let handler = h.lazy ? lazyEventHandler(h.handler as any) : h.handler

  const referenceRoute = h.route.replaceAll(/:\w+|\*\*/g, '_')
  const routeOptions = routerOptions.lookup(referenceRoute) || {}
  if (routeOptions.swr) {
    handler = cachedEventHandler(handler)
  }

  if (h.route === '/') {
    app.use(handler)
  } else {
    router.use(h.route, handler)
  }
}

app.use(router)

export const localCall = createCall(app.nodeHandler as any)
export const localFetch = createLocalFetch(localCall, globalThis.fetch)

export const $fetch = createFetch({ fetch: localFetch, Headers })

globalThis.$fetch = $fetch
