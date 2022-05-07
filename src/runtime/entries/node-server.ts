import '#internal/nitro/virtual/polyfill'
import { Server as HttpServer } from 'http'
import { Server as HttpsServer } from 'https'
import destr from 'destr'
import { nitroApp } from '../app'
import { useRuntimeConfig } from '#internal/nitro'

const cert = process.env.NITRO_SSL_CERT
const key = process.env.NITRO_SSL_KEY

const server = cert && key ? new HttpsServer({ key, cert }, nitroApp.h3App.nodeHandler) : new HttpServer(nitroApp.h3App.nodeHandler)

const port = (destr(process.env.NITRO_PORT || process.env.PORT) || 3000) as number
const hostname = process.env.NITRO_HOST || process.env.HOST || '0.0.0.0'

// @ts-ignore
server.listen(port, hostname, (err) => {
  if (err) {
    console.error(err)
    process.exit(1)
  }
  const protocol = cert && key ? 'https' : 'http'
  console.log(`Listening on ${protocol}://${hostname}:${port}${useRuntimeConfig().app.baseURL}`)
})

process.on('unhandledRejection', err => console.error('[nitro] [dev] [unhandledRejection] ' + err))
process.on('uncaughtException', err => console.error('[nitro] [dev] [uncaughtException] ' + err))

export default {}
