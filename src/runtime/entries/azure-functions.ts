import '#internal/nitro/virtual/polyfill'
import { nitroApp } from '../app'

export async function handle (context, req) {
  const url = '/' + (req.params.url || '')

  const { body, status, statusText, headers } = await nitroApp.localCall({
    url,
    headers: req.headers,
    method: req.method,
    body: req.rawBody
  })

  context.res = {
    status,
    headers,
    body: body ? body.toString() : statusText
  }
}
