import './config'
import { createApp, createRouter, lazyEventHandler } from 'h3'
import { createFetch, Headers } from 'ohmyfetch'
import destr from 'destr'
import { createCall, createFetch as createLocalFetch } from 'unenv/runtime/fetch/index'
import { timingMiddleware } from './timing'
import handleError from '#nitro/error'
import { handlers } from '#nitro/virtual/server-handlers'

export const app = createApp({
  debug: destr(process.env.DEBUG),
  onError: handleError
})

app.use(timingMiddleware)

const router = createRouter()

for (const h of handlers) {
  const handler = h.lazy ? lazyEventHandler(h.handler as any) : h.handler
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
