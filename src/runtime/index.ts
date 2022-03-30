import './config'
import { createApp } from 'h3'
import { createFetch, Headers } from 'ohmyfetch'
import destr from 'destr'
import { createCall, createFetch as createLocalFetch } from 'unenv/runtime/fetch/index'
import { timingMiddleware } from './timing'
// @ts-ignore
import handleError from '#nitro-error'
// @ts-ignore
import serverHandlers from '#server-handlers'

export const app = createApp({
  debug: destr(process.env.DEBUG),
  onError: handleError
})

app.use(timingMiddleware)
app.use(serverHandlers)

export const localCall = createCall(app.nodeHandler as any)
export const localFetch = createLocalFetch(localCall, globalThis.fetch)

export const $fetch = createFetch({ fetch: localFetch, Headers })

globalThis.$fetch = $fetch
