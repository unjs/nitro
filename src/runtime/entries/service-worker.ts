// @ts-nocheck
import '#nitro/virtual/polyfill'
import { requestHasBody, useRequestBody } from '../utils'
import { nitroApp } from '../app'
import { isPublicAssetURL } from '#nitro/virtual/public-assets'

addEventListener('fetch', (event: any) => {
  const pathname = new URL(event.request.url).pathname
  if (isPublicAssetURL(pathname) || pathname.includes('/_server/')) {
    return
  }

  event.respondWith(handleEvent(url, event))
})

async function handleEvent (url, event) {
  let body
  if (requestHasBody(event.request)) {
    body = await useRequestBody(event.request)
  }

  const r = await nitroApp.localCall({
    event,
    url: url.pathname + url.search,
    host: url.hostname,
    protocol: url.protocol,
    headers: event.request.headers,
    method: event.request.method,
    redirect: event.request.redirect,
    body
  })

  return new Response(r.body, {
    headers: r.headers,
    status: r.status,
    statusText: r.statusText
  })
}

self.addEventListener('install', () => {
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim())
})
