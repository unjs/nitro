import destr from 'destr'

import { handler } from './deno'
import { useRuntimeConfig } from '#internal/nitro'

// @ts-ignore
const cert = Deno.env.get('NITRO_SSL_CERT')
// @ts-ignore
const key = Deno.env.get('NITRO_SSL_KEY')
// @ts-ignore
const port = destr(Deno.env.get('NITRO_PORT') || Deno.env.get('PORT')) || 3e3
// @ts-ignore
const hostname = Deno.env.get('NITRO_HOST') || Deno.env.get('HOST')

function onListen ({ port, hostname }) {
  const baseURL = (useRuntimeConfig().app.baseURL || '').replace(/\/$/, '')
  const url = `${hostname}:${port}${baseURL}`
  console.log(`Listening ${url}`)
}

// @ts-ignore
if (Deno.env.get('DEBUG')) {
  addEventListener('unhandledrejection', event =>
    console.error('[nitro] [dev] [unhandledRejection]', event.reason)
  )
  addEventListener('error', event =>
    console.error('[nitro] [dev] [uncaughtException]', event.error)
  )
} else {
  addEventListener('unhandledrejection', err =>
    console.error('[nitro] [dev] [unhandledRejection] ' + err)
  )
  addEventListener('error', event =>
    console.error('[nitro] [dev] [uncaughtException] ' + event.error)
  )
}

// @ts-ignore
Deno.serve(handler, { key, cert, port, hostname, onListen })

export default {}
