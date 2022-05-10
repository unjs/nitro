import { pathToFileURL } from 'url'
import { resolve, join } from 'pathe'
import { parseURL } from 'ufo'
import chalk from 'chalk'
import { createNitro } from './nitro'
import { build } from './build'
import type { Nitro, PrerenderRoute } from './types'
import { writeFile } from './utils'

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
    return true
  }

  const generateRoute = async (route: string) => {
    const start = Date.now()

    // Check if we should render routee
    if (!canPrerender(route)) { return }
    generatedRoutes.add(route)
    routes.delete(route)

    // Create result object
    const _route: PrerenderRoute = { route }

    // Fetch the route
    const res = await (localFetch(route, { headers: { 'X-Nitro-Prerender': route } }) as ReturnType<typeof fetch>)
    _route.contents = await res.text()
    if (res.status !== 200) {
      _route.error = new Error(`[${res.status}] ${res.statusText}`) as any
      _route.error.statusCode = res.status
      _route.error.statusMessage = res.statusText
    }

    // Write to the file
    const isImplicitHTML = !route.endsWith('.html') && (res.headers.get('content-type') || '').includes('html')
    const routeWithIndex = route.endsWith('/') ? route + 'index' : route
    _route.fileName = isImplicitHTML ? route + '/index.html' : routeWithIndex
    const filePath = join(nitro.options.output.publicDir, _route.fileName)
    await writeFile(filePath, _route.contents)

    // Crawl route links
    if (
      !_route.error &&
      nitro.options.prerender.crawlLinks &&
      isImplicitHTML
    ) {
      const crawledRoutes = extractLinks(_route.contents, route, res)
      for (const crawledRoute of crawledRoutes) {
        if (canPrerender(crawledRoute)) {
          routes.add(crawledRoute)
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
}

const LINK_REGEX = /href=['"]?([^'" >]+)/g

function extractLinks (html: string, from: string, res: Response) {
  const links: string[] = []
  const _links: string[] = []

  // Extract from any <TAG href="">
  _links.push(...Array.from(html.matchAll(LINK_REGEX)).map(m => m[1]))

  // Extract from X-Nitro-Prerender headers
  const header = res.headers.get('x-nitro-prerender') || ''
  _links.push(...header.split(',').map(i => i.trim()))

  for (const link of _links.filter(Boolean)) {
    const parsed = parseURL(link)
    if (parsed.protocol) { continue }
    let { pathname } = parsed
    if (!allowedExtensions.has(getExtension(pathname))) { continue }
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
