import { resolve, join, extname } from 'pathe'
import { joinURL } from 'ufo'
import { globby } from 'globby'
import { watch } from 'chokidar'
import type { Middleware } from 'h3'

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

function filesToMiddleware (files: string[], baseDir: string, baseURL: string, overrides?: Partial<ServerMiddleware>): ServerMiddleware[] {
  return files.map((file) => {
    const route = joinURL(
      baseURL,
      file
        .slice(0, file.length - extname(file).length)
        .replace(/\/index$/, '')
    )
    const handle = resolve(baseDir, file)
    return {
      route,
      handle
    }
  })
    .sort((a, b) => b.route.localeCompare(a.route))
    .map(m => ({ ...m, ...overrides }))
}

export function scanMiddleware (serverDir: string, onChange?: (results: ServerMiddleware[], event: 'add' | 'addDir' | 'change' | 'unlink' | 'unlinkDir', file: string) => void): Promise<ServerMiddleware[]> {
  const pattern = '**/*.{ts,mjs,js,cjs}'
  const globalDir = resolve(serverDir, 'middleware')
  const apiDir = resolve(serverDir, 'api')

  const scan = async () => {
    const globalFiles = await globby(pattern, { cwd: globalDir, dot: true })
    const apiFiles = await globby(pattern, { cwd: apiDir, dot: true })
    return [
      ...filesToMiddleware(globalFiles, globalDir, '/', { route: '/' }),
      ...filesToMiddleware(apiFiles, apiDir, '/api', { lazy: true })
    ]
  }

  if (typeof onChange === 'function') {
    const watcher = watch([
      join(globalDir, pattern),
      join(apiDir, pattern)
    ], { ignoreInitial: true })
    watcher.on('all', async (event, file) => {
      onChange(await scan(), event, file)
    })
  }

  return scan()
}
