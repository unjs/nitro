import { resolve, join } from 'pathe'
import { hasProtocol } from 'ufo'
import Listr from 'listr'
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
  nitro.logger.info('Prerendering routes')
  const nitroRenderer = await createNitro({
    ...nitro.options._config,
    rootDir: nitro.options.rootDir,
    logLevel: 0,
    preset: 'nitro-prerender'
  })
  await build(nitroRenderer)

  // Import renderer entry
  const { localFetch } = await import(resolve(nitroRenderer.options.output.serverDir, 'index.mjs'))

  // Start prerendering
  const generatedRoutes = new Set()

  const generateRoute = async (route: string) => {
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
      return new Set(extractLinks(contents, route))
    }
  }

  function createTasks (routes: Set<string>) {
    const tasks = new Listr([], { concurrent: 1, exitOnError: false, collapse: false })
    for (const route of routes) {
      tasks.add({
        title: `Generating ${route}`,
        skip: () => generatedRoutes.has(route),
        task: async () => {
          generatedRoutes.add(route)
          const newRoutes = await generateRoute(route)
          if (newRoutes && newRoutes.size) {
            return createTasks(newRoutes)
          }
        }
      })
    }
    return tasks
  }
  const tasks = createTasks(routes)
  await tasks.run().catch(() => {})
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
