import { resolve, join } from 'pathe'
import { globby } from 'globby'

import { withBase, withLeadingSlash, withoutTrailingSlash } from 'ufo'
import type { Nitro, NitroEventHandler } from './types'

export const GLOB_SCAN_PATTERN = '**/*.{ts,mjs,js,cjs}'
type FileInfo = { dir: string, path: string, fullPath: string }

const httpMethodRegex = /\.(connect|delete|get|head|options|patch|post|put|trace)/

export async function scanHandlers (nitro: Nitro) {
  const handlers = await Promise.all([
    scanMiddleware(nitro),
    scanRoutes(nitro, 'api', '/api'),
    scanRoutes(nitro, 'routes', '/')
  ]).then(r => r.flat())

  nitro.scannedHandlers = handlers.flatMap(h => h.handlers)

  return handlers
}

export function scanMiddleware (nitro: Nitro) {
  return scanServerDir(nitro, 'middleware', file => ({
    middleware: true,
    handler: file.fullPath
  }))
}

export function scanRoutes (nitro: Nitro, dir: string, prefix: string = '/') {
  return scanServerDir(nitro, dir, (file) => {
    let route = file.path
      .replace(/\.[a-zA-Z]+$/, '')
      .replace(/\[\.\.\.\]/g, '**')
      .replace(/\[\.\.\.(\w+)]/g, '**:$1')
      .replace(/\[(\w+)\]/g, ':$1')
    route = withLeadingSlash(withoutTrailingSlash(withBase(route, prefix)))

    let method
    const methodMatch = route.match(httpMethodRegex)
    if (methodMatch) {
      route = route.substring(0, methodMatch.index)
      method = methodMatch[1]
    }

    route = route.replace(/\/index$/, '') || '/'

    return {
      handler: file.fullPath,
      lazy: true,
      route,
      method
    }
  })
}

async function scanServerDir (nitro: Nitro, name: string, mapper: (file: FileInfo) => NitroEventHandler) {
  const dirs = nitro.options.scanDirs.map(dir => join(dir, name))
  const files = await scanDirs(dirs)
  const handlers: NitroEventHandler[] = files.map(mapper)
  return { dirs, files, handlers }
}

export async function scanPlugins (nitro: Nitro) {
  const plugins = []
  for (const dir of nitro.options.scanDirs) {
    const pluginDir = join(dir, 'plugins')
    const pluginFiles = await globby(GLOB_SCAN_PATTERN, { cwd: pluginDir, absolute: true })
    plugins.push(...pluginFiles.sort())
  }
  return plugins
}

function scanDirs (dirs: string[]): Promise<FileInfo[]> {
  return Promise.all(dirs.map(async (dir) => {
    const fileNames = await globby(GLOB_SCAN_PATTERN, { cwd: dir, dot: true })
    return fileNames.map(fileName => ({
      dir,
      path: fileName,
      fullPath: resolve(dir, fileName)
    })).sort((a, b) => b.path.localeCompare(a.path))
  })).then(r => r.flat())
}
