import { pathToFileURL } from 'url'
import { resolve, join } from 'pathe'
import { joinURL, parseURL, withBase, withoutBase } from 'ufo'
import chalk from 'chalk'
import { createNitro } from './nitro'
import { build } from './build'
import type { Nitro, PrerenderGenerateRoute, PrerenderRoute } from './types'
import { writeFile } from './utils'
import { compressPublicAssets } from './compress'

const allowedExtensions = new Set(['', '.json'])

export async function prerender (nitro: Nitro) {
  // Skip if no prerender routes specified
  const routes = new Set(nitro.options.prerender.routes)
  if (nitro.options.prerender.crawlLinks && !routes.size) {
    routes.add('/')
  }
  if (!routes.size) {
    return
  }
  // Build with prerender preset
  nitro.logger.info('Initializing prerenderer')
  nitro._prerenderedRoutes = []
  const nitroRenderer = await createNitro({
    ...nitro.options._config,
    rootDir: nitro.options.rootDir,
    logLevel: 0,
    preset: 'nitro-prerender'
  })
  await build(nitroRenderer)

  // Import renderer entry
  const serverEntrypoint = resolve(nitroRenderer.options.output.serverDir, 'index.mjs')
  const { localFetch } = await import(pathToFileURL(serverEntrypoint).href)

  // Start prerendering
  const generatedRoutes = new Set()
  const canPrerender = (route: string = '/') => {
    if (generatedRoutes.has(route)) { return false }
    if (route.length > 250) { return false }
    for (const ignore of nitro.options.prerender.ignore) {
      if (route.startsWith(ignore)) { return false }
    }
    return true
  }

  const generateRoute = async (route: string) => {
    const start = Date.now()

    // Check if we should render route
    if (!canPrerender(route)) { return }
    generatedRoutes.add(route)
    routes.delete(route)

    // Create result object
    const _route: PrerenderGenerateRoute = { route }

    // Fetch the route
    const res = await (localFetch(withBase(route, nitro.options.baseURL), { headers: { 'x-nitro-prerender': route } }) as ReturnType<typeof fetch>)
    _route.data = await res.arrayBuffer()
    Object.defineProperty(_route, 'contents', {
      get: () => {
        if (!(_route as any)._contents) {
          (_route as any)._contents = new TextDecoder('utf-8').decode(new Uint8Array(_route.data))
        }
        return (_route as any)._contents
      },
      set (value: string) {
        (_route as any)._contents = value
        _route.data = new TextEncoder().encode(value)
      }
    })
    if (res.status !== 200) {
      _route.error = new Error(`[${res.status}] ${res.statusText}`) as any
      _route.error.statusCode = res.status
      _route.error.statusMessage = res.statusText
    }

    // Write to the file
    const isImplicitHTML = !route.endsWith('.html') && (res.headers.get('content-type') || '').includes('html')
    const routeWithIndex = route.endsWith('/') ? route + 'index' : route
    _route.fileName = isImplicitHTML ? joinURL(route, 'index.html') : routeWithIndex
    _route.fileName = withoutBase(_route.fileName, nitro.options.baseURL)

    await nitro.hooks.callHook('prerender:generate', _route, nitro)

    // Check if route skipped or has errors
    if (_route.skip || _route.error) { return }

    const filePath = join(nitro.options.output.publicDir, _route.fileName)
    await writeFile(filePath, Buffer.from(_route.data))
    nitro._prerenderedRoutes.push(_route)

    // Crawl route links
    if (!_route.error && isImplicitHTML) {
      const extractedLinks = extractLinks(_route.contents, route, res, nitro.options.prerender.crawlLinks)
      for (const _link of extractedLinks) {
        if (canPrerender(_link)) {
          routes.add(_link)
        }
      }
    }

    _route.generateTimeMS = Date.now() - start
    return _route
  }

  nitro.logger.info(nitro.options.prerender.crawlLinks
    ? `Prerendering ${routes.size} initial routes with crawler`
    : `Prerendering ${routes.size} routes`
  )
  for (let i = 0; i < 100 && routes.size; i++) {
    for (const route of Array.from(routes)) {
      const _route = await generateRoute(route).catch(error => ({ route, error } as PrerenderRoute))

      // Skipped (not allowed or duplicate)
      if (!_route) { continue }

      await nitro.hooks.callHook('prerender:route', _route)
      nitro.logger.log(chalk[_route.error ? 'yellow' : 'gray'](`  ├─ ${_route.route} (${_route.generateTimeMS}ms) ${_route.error ? `(${_route.error})` : ''}`))
    }
  }

  if (nitro.options.compressPublicAssets) {
    await compressPublicAssets(nitro)
  }
}

const LINK_REGEX = /href=['"]?([^'" >]+)/g

function extractLinks (html: string, from: string, res: Response, crawlLinks: boolean) {
  const links: string[] = []
  const _links: string[] = []

  // Extract from any <TAG href=""> to crawl
  if (crawlLinks) {
    _links.push(
      ...Array.from(html.matchAll(LINK_REGEX))
        .map(m => m[1])
        .filter(link => allowedExtensions.has(getExtension(link)))
    )
  }

  // Extract from x-nitro-prerender headers
  const header = res.headers.get('x-nitro-prerender') || ''
  _links.push(...header.split(',').map(i => i.trim()))

  for (const link of _links.filter(Boolean)) {
    const parsed = parseURL(link)
    if (parsed.protocol) { continue }
    let { pathname } = parsed
    if (!pathname.startsWith('/')) {
      const fromURL = new URL(from, 'http://localhost')
      pathname = new URL(pathname, fromURL).pathname
    }
    links.push(pathname)
  }
  return links
}

const EXT_REGEX = /\.[a-z0-9]+$/

function getExtension (path: string): string {
  return (path.match(EXT_REGEX) || [])[0] || ''
}
