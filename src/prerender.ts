import { resolve, relative, join } from 'pathe'
import { createNitro } from './nitro'
import { build } from './build'
import type { Nitro } from './types'
import { writeFile } from './utils'

const CRAWL_EXTENSIONS = new Set(['', '.html', '.json'])

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
  nitro.logger.start('Preparing prerenderer...')
  const nitroRenderer = await createNitro({
    ...nitro.options._config,
    rootDir: nitro.options.rootDir,
    logLevel: 0,
    preset: 'prerender'
  })
  await build(nitroRenderer)

  // Import renderer entry
  const app = await import(resolve(nitroRenderer.options.output.serverDir, 'index.mjs'))

  // Start prerendering
  const generatedRoutes = new Set()
  const generateRoute = async (route: string) => {
    const res = await app.localFetch(route)
    const contents = await res.text()

    const additionalExtension = getExtension(route) ? '' : guessExt(res.headers.get('content-type'))
    const routeWithIndex = route.endsWith('/') ? route + 'index' : route
    const fileName = routeWithIndex + additionalExtension
    const filePath = join(nitro.options.output.publicDir, fileName)
    await writeFile(filePath, contents)

    const rPath = relative(process.cwd(), filePath)
    nitro.logger.log(` - [${res.status}] Prerendered \`${route}\` to \`${rPath}\``)

    // Crawl Links
    if (nitro.options.prerender.crawlLinks && fileName.endsWith('.html')) {
      const extractedLinks = extractLinks(contents, route)
        .filter(link =>
          !generatedRoutes.has(link) &&
          link.match(/^\//g) &&
          CRAWL_EXTENSIONS.has(getExtension(link))
        )
      for (const route of extractedLinks) { routes.add(route) }
    }
  }

  const generateAll = async () => {
    const results = await Promise.all(Array.from(routes).map(async (route) => {
      if (generatedRoutes.has(route)) { return false }
      generatedRoutes.add(route)
      await generateRoute(route).catch((error) => {
        nitro.logger.error(`Error while generating route ${route}`, error)
      })
      return true
    }))
    return results.filter(Boolean).length // At least one route generated
  }

  for (let i = 0; i < 100; i++) {
    const routesGenerated = await generateAll()
    if (!routesGenerated) {
      break
    }
  }
}

const LINK_REGEX = /href=['"]?([^'" >]+)/g
function extractLinks (html: string, _url: string) {
  const links: string[] = []
  for (const match of html.matchAll(LINK_REGEX)) {
    links.push(match[1])
  }
  return links
}

const EXT_REGEX = /\.[a-z0-9]+$/
function getExtension (path: string): string {
  return (path.match(EXT_REGEX) || [])[0] || ''
}

const ContentTypeToExt = {
  json: '.json',
  html: '.html'
}
function guessExt (contentType: string = ''): string {
  for (const pattern in ContentTypeToExt) {
    if (contentType.includes(pattern)) {
      return ContentTypeToExt[pattern]
    }
  }
  return ''
}
