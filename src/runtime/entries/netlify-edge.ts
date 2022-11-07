import '#internal/nitro/virtual/polyfill'
import { nitroApp } from '../app'
import { requestHasBody, useRequestBody } from '../utils'

export default async function (request: Request, _context) {
  const url = new URL(request.url)
  const body = requestHasBody(request) && await useRequestBody(request)

  const r = await nitroApp.localCall({
    url: url.pathname + url.search,
    host: url.hostname,
    protocol: url.protocol,
    // @ts-ignore TODO
    headers: request.headers,
    method: request.method,
    redirect: request.redirect,
    body
  })

  return new Response(r.body, {
    headers: r.headers as HeadersInit,
    status: r.status,
    statusText: r.statusText
  })
}
