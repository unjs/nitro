import { pathToFileURL } from 'url'
import { resolve, join } from 'pathe'
import { parseURL } from 'ufo'
import chalk from 'chalk'
import { createNitro } from './nitro'
import { build } from './build'
import type { Nitro } from './types'
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
    if (!canPrerender(route)) { return }
    generatedRoutes.add(route)
    routes.delete(route)
    const res = await (localFetch(route, { headers: { 'X-Nitro-Prerender': route } }) as ReturnType<typeof fetch>)
    const contents = await res.text()
    if (res.status !== 200) {
      throw new Error(`[${res.status}] ${res.statusText}`)
    }

    const isImplicitHTML = !route.endsWith('.html') && (res.headers.get('content-type') || '').includes('html')
    const routeWithIndex = route.endsWith('/') ? route + 'index' : route
    const fileName = isImplicitHTML ? route + '/index.html' : routeWithIndex
    const filePath = join(nitro.options.output.publicDir, fileName)
    await writeFile(filePath, contents)
    // Crawl Links
    if (
      nitro.options.prerender.crawlLinks &&
      isImplicitHTML
    ) {
      const crawledRoutes = extractLinks(contents, route, res)
      for (const crawledRoute of crawledRoutes) {
        if (canPrerender(crawledRoute)) {
          routes.add(crawledRoute)
        }
      }
    }
  }

  nitro.logger.info(nitro.options.prerender.crawlLinks
    ? `Prerendering ${routes.size} initial routes with crawler`
    : `Prerendering ${routes.size} routes`
  )
  for (let i = 0; i < 100 && routes.size; i++) {
    for (const route of Array.from(routes)) {
      const start = Date.now()
      const error = await generateRoute(route).catch(err => err)
      const end = Date.now()
      nitro.logger.log(chalk.gray(`  ├─ ${route} (${end - start}ms) ${error ? `(${error})` : ''}`))
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
