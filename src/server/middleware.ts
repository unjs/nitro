import { resolve, join, extname } from 'pathe'
import { withBase } from 'ufo'
import { globby } from 'globby'
import { watch } from 'chokidar'
import type { Middleware } from 'h3'
import { Nitro } from '../types'

export interface ServerMiddleware {
  route: string
  /**
   * @deprecated use route
   */
  path?: string

  /**
   * @deprecated use handler
   */
  handle?: Middleware | string
  handler?: Middleware | string

  lazy?: boolean // Default is true
  promisify?: boolean // Default is true
}

function filesToMiddleware (files: string[], baseDir: string, prefix: string, overrides?: Partial<ServerMiddleware>): ServerMiddleware[] {
  return files.map((fileName: string) => {
    const normalizedName = fileName
      .slice(0, fileName.length - extname(fileName).length)
      .replace(/\/index$/, '')
    const route = withBase(normalizedName, prefix)
    const handler = resolve(baseDir, fileName)
    return {
      route,
      handler
    }
  })
    .sort((a, b) => b.route.localeCompare(a.route))
    .map(m => ({ ...m, ...overrides }))
}

export function scanMiddleware (nitro: Nitro, onChange?: (results: ServerMiddleware[], event: 'add' | 'addDir' | 'change' | 'unlink' | 'unlinkDir', file: string) => void): Promise<ServerMiddleware[]> {
  const globPattern = '**/*.{ts,mjs,js,cjs}'

  type ScanOptions = { cwd: string, name: string, prefix: string, options: Partial<ServerMiddleware> }
  const scanDirs: ScanOptions[] = []
  for (const dir of nitro.options.scanDirs) {
    scanDirs.push({
      cwd: dir,
      name: 'api',
      prefix: '/api',
      options: { lazy: true }
    })
    scanDirs.push({
      cwd: dir,
      name: 'middleware',
      prefix: '/',
      options: {}
    })
  }

  const scan = async () => {
    const middleware = (await Promise.all(scanDirs.map(async (scanDir) => {
      const cwd = join(scanDir.cwd, scanDir.name)
      const files = await globby(globPattern, { cwd, dot: true })
      return filesToMiddleware(files, cwd, scanDir.prefix, scanDir.options)
    }))).flat()
    return middleware
  }

  if (typeof onChange === 'function') {
    const watcher = watch(scanDirs.map(dir => join(dir.cwd, dir.name, globPattern)), { ignoreInitial: true })
    watcher.on('all', async (event, file) => {
      onChange(await scan(), event, file)
    })
  }

  return scan()
}
