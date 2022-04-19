import { resolve, join } from 'pathe'
import { hasProtocol } from 'ufo'
import ora from 'ora'
import { createNitro } from './nitro'
import { build } from './build'
import type { Nitro } from './types'
import { writeFile } from './utils'

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
  const spinner = ora('Initializing prerender').start()
  const nitroRenderer = await createNitro({
    ...nitro.options._config,
    rootDir: nitro.options.rootDir,
    logLevel: 0,
    preset: 'nitro-prerender'
  })
  spinner.start('Building prerenderer')
  await build(nitroRenderer)

  // Import renderer entry
  spinner.start('Starting prerenderer')
  const { localFetch } = await import(resolve(nitroRenderer.options.output.serverDir, 'index.mjs'))
  spinner.succeed('Prerenderer initialized')

  // Start prerendering
  const generatedRoutes = new Set()
  const isGenerated = (route: string) => generatedRoutes.has(route)

  const generateRoute = async (route: string) => {
    if (isGenerated(route)) { return }
    generatedRoutes.add(route)
    routes.delete(route)
    const res = await (localFetch(route) as ReturnType<typeof fetch>)
    const contents = await res.text()
    if (res.status !== 200) {
      throw new Error('[HTTP] ' + res.status + ' ' + res.statusText)
    }
    const routeWithIndex = route.endsWith('/') ? route + 'index' : route
    const isImplicitHTML = (res.headers.get('content-type') || '').includes('html')
    const fileName = isImplicitHTML ? routeWithIndex + '.html' : routeWithIndex
    const filePath = join(nitro.options.output.publicDir, fileName)
    await writeFile(filePath, contents)
    // Crawl Links
    if (
      nitro.options.prerender.crawlLinks &&
      isImplicitHTML
    ) {
      const crawledRoutes = extractLinks(contents, route)
      for (const crawledRoute of crawledRoutes) {
        if (!isGenerated(crawledRoute)) {
          routes.add(crawledRoute)
        }
      }
    }
  }

  for (let i = 0; i < 100 && routes.size; i++) {
    for (const route of Array.from(routes)) {
      spinner.start('Prerendering ' + route)
      const error = await generateRoute(route).catch(err => err)
      if (error) {
        spinner.warn('Prerendered ' + route + ': ' + error.message)
      } else {
        spinner.succeed('Prerendered ' + route)
      }
    }
  }
}

const LINK_REGEX = /href=['"]?([^'" >]+)/g

function extractLinks (html: string, _url: string) {
  const links: string[] = []
  for (const match of html.matchAll(LINK_REGEX)) {
    const url = match[1]
    if (!url || hasProtocol(url) || getExtension(url)) {
      continue
    }
    if (!url.startsWith('/')) {
      // TODO: Handle relative urls with _url
      continue
    }
    links.push(url)
  }
  return links
}

const EXT_REGEX = /\.[a-z0-9]+$/
function getExtension (path: string): string {
  return (path.match(EXT_REGEX) || [])[0] || ''
}
