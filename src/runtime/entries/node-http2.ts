import '#internal/nitro/virtual/polyfill'
import { createSecureServer } from 'http2'
import destr from 'destr'
import { nitroApp } from '../app'
import { useRuntimeConfig } from '#internal/nitro'

const cert = process.env.NITRO_SSL_CERT
const key = process.env.NITRO_SSL_KEY

// @ts-ignore
const server = createSecureServer({ key, cert }, nitroApp.h3App.nodeHandler)

const port = (destr(process.env.NITRO_PORT || process.env.PORT) || 3000) as number
const hostname = process.env.NITRO_HOST || process.env.HOST || '0.0.0.0'

// @ts-ignore
server.listen(port, hostname, (err) => {
  if (err) {
    console.error(err)
    process.exit(1)
  }
  const protocol = 'https'
  console.log(`Listening on ${protocol}://${hostname}:${port}${useRuntimeConfig().app.baseURL}`)
})

if (process.env.DEBUG) {
  process.on('unhandledRejection', err => console.error('[nitro] [dev] [unhandledRejection]', err))
  process.on('uncaughtException', err => console.error('[nitro] [dev] [uncaughtException]', err))
} else {
  process.on('unhandledRejection', err => console.error('[nitro] [dev] [unhandledRejection] ' + err))
  process.on('uncaughtException', err => console.error('[nitro] [dev] [uncaughtException] ' + err))
}

export default {}
