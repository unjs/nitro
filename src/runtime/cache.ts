import { hash } from 'ohash'
import { H3Response, toEventHandler } from 'h3'
import type { CompatibilityEventHandler, CompatibilityEvent } from 'h3'
import { storage } from '#nitro'

export interface CacheEntry<T=any> {
  value?: T
  expires?: number
  mtime?: number
  integrity?: string
}

export interface CachifyOptions<T=any> {
  name?: string
  getKey?: (...args: any[]) => string
  transform?: (entry: CacheEntry<T>, ...args: any[]) => any
  group?: string
  integrity?: any
  ttl?: number
  swr?: boolean
  base?: string
}

const defaultCacheOptions = {
  name: '_',
  base: '/cache',
  swr: true,
  ttl: 1
}

export function defineCachedFunction <T=any> (fn: ((...args) => T | Promise<T>), opts: CachifyOptions<T>) {
  opts = { ...defaultCacheOptions, ...opts }

  const pending: { [key: string]: Promise<T> } = {}

  // Normalize cache params
  const group = opts.group || 'nitro'
  const name = opts.name || fn.name || '_'
  const integrity = hash([opts.integrity, fn, opts])

  async function get (key: string, resolver: () => T | Promise<T>): Promise<CacheEntry<T>> {
    const cacheKey = [opts.base, group, name, key].filter(Boolean).join(':')
    const entry: CacheEntry<T> = await storage.getItem(cacheKey) as any || {}

    const ttl = (opts.ttl ?? opts.ttl ?? 0) * 1000
    if (ttl) {
      entry.expires = Date.now() + ttl
    }

    const expired = (entry.integrity !== integrity) || (ttl && (Date.now() - (entry.mtime || 0)) > ttl)

    const _resolve = async () => {
      if (!pending[key]) {
        pending[key] = Promise.resolve(resolver())
      }
      entry.value = await pending[key]
      entry.mtime = Date.now()
      entry.integrity = integrity
      delete pending[key]
      storage.setItem(cacheKey, entry).catch(error => console.error('[nitro] [cache]', error))
    }

    const _resolvePromise = expired ? _resolve() : Promise.resolve()

    if (opts.swr && entry.value) {
      // eslint-disable-next-line no-console
      _resolvePromise.catch(console.error)
      return Promise.resolve(entry)
    }

    return _resolvePromise.then(() => entry)
  }

  return async (...args) => {
    const key = (opts.getKey || getKey)(...args)
    const entry = await get(key, () => fn(...args))
    let value = entry.value
    if (opts.transform) {
      value = await opts.transform(entry, ...args) || value
    }
    return value
  }
}

export const cachedFunction = defineCachedFunction

function getKey (...args: string[]) {
  return args.length ? hash(args, {}) : ''
}

export function defineCachedEventHandler (handler: CompatibilityEventHandler, opts: Omit<CachifyOptions, 'getKey'> = defaultCacheOptions) {
  interface ResponseCacheEntry {
    body: H3Response
    code: number
    headers: Record<string, string | number | string[]>
  }

  const _opts: CachifyOptions<ResponseCacheEntry> = {
    ...opts,
    getKey: req => req.originalUrl || req.url,
    group: opts.group || 'nitro/handlers',
    integrity: [
      opts.integrity,
      handler
    ],
    transform (entry, event: CompatibilityEvent) {
      if (event.res.headersSent) {
        // Event already handled -_-
        return
      }
      for (const header in entry.value.headers) {
        event.res.setHeader(header, entry.value.headers[header])
      }
      const cacheControl = []
      if (opts.swr) {
        if (opts.ttl) {
          cacheControl.push(`s-maxage=${opts.ttl / 1000}`)
        }
        cacheControl.push('stale-while-revalidate')
      } else if (opts.ttl) {
        cacheControl.push(`max-age=${opts.ttl / 1000}`)
      }
      if (cacheControl.length) {
        event.res.setHeader('Cache-Control', cacheControl.join(', '))
      }
      if (entry.value.code) {
        event.res.statusCode = entry.value.code
      }
      return entry.value.body
    }
  }

  const _handler = toEventHandler(handler)
  return cachedFunction<ResponseCacheEntry>(async (event: CompatibilityEvent) => {
    const body = await _handler(event)
    const headers = event.res.getHeaders()
    const cacheEntry: ResponseCacheEntry = {
      code: event.res.statusCode,
      headers,
      body
    }
    return cacheEntry
  }, _opts)
}

export const cachedEventHandler = defineCachedEventHandler
