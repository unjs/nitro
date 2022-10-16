// @ts-ignore
import process from 'https://deno.land/std/node/process.ts'
// @ts-ignore
import { serve, serveTls } from 'https://deno.land/std/http/server.ts'

import destr from 'destr'

import { handler } from './deno'
import { useRuntimeConfig } from '#internal/nitro'

const cert = process.env.NITRO_SSL_CERT
const key = process.env.NITRO_SSL_KEY
const port = destr(process.env.NITRO_PORT || process.env.PORT) || 3e3
const hostname = process.env.NITRO_HOST || process.env.HOST

if (cert && key) {
  serveTls(handler, { key, cert, port, hostname, onListen })
} else {
  serve(handler, { port, hostname, onListen })
}

function onListen ({ port, hostname }) {
  const baseURL = (useRuntimeConfig().app.baseURL || '').replace(/\/$/, '')
  const url = `${hostname}:${port}${baseURL}`
  console.log(`Listening ${url}`)
}

if (process.env.DEBUG) {
  process.on('unhandledRejection', err =>
    console.error('[nitro] [dev] [unhandledRejection]', err)
  )
  process.on('uncaughtException', err =>
    console.error('[nitro] [dev] [uncaughtException]', err)
  )
} else {
  process.on('unhandledRejection', err =>
    console.error('[nitro] [dev] [unhandledRejection] ' + err)
  )
  process.on('uncaughtException', err =>
    console.error('[nitro] [dev] [uncaughtException] ' + err)
  )
}

export default {}
