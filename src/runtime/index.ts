import './config'
import { createApp } from 'h3'
import { createFetch, Headers } from 'ohmyfetch'
import destr from 'destr'
import { createCall, createFetch as createLocalFetch } from 'unenv/runtime/fetch/index'
import { timingMiddleware } from './timing'
import { handleError } from './error'
// @ts-ignore
import serverMiddleware from '#server-middleware'

export const app = createApp({
  debug: destr(process.env.DEBUG),
  onError: handleError
})

app.use(timingMiddleware)
app.use(serverMiddleware)

app.use('/test', () => 'OK')

export const localCall = createCall(app.nodeHandler as any)
export const localFetch = createLocalFetch(localCall, globalThis.fetch)

export const $fetch = createFetch({ fetch: localFetch, Headers })

globalThis.$fetch = $fetch
