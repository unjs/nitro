import { resolve, join } from 'pathe'
import { globby } from 'globby'
import { withBase } from 'ufo'
import type { Nitro, NitroEventHandler } from './types'

export const GLOB_SCAN_PATTERN = '**/*.{ts,mjs,js,cjs}'
type FileInfo = { dir: string, name: string, path: string }

export async function scanHandlers (nitro) {
  const handlers = await Promise.all([
    scanMiddleware(nitro),
    scanAPI(nitro)
  ]).then(r => r.flat())

  nitro.scannedHandlers = handlers.flatMap(h => h.handlers)

  return handlers
}

export function scanMiddleware (nitro: Nitro) {
  return scanServerDir(nitro, 'middleware', file => ({ handler: file.path, route: '/' }))
}

export function scanAPI (nitro: Nitro) {
  return scanServerDir(nitro, 'api', file => ({ handler: file.path, route: withBase(file.name.replace(/\[([a-z]+)\]/g, ':$1'), '/api') }))
}

async function scanServerDir (nitro: Nitro, name: string, mapper: (file: FileInfo) => NitroEventHandler) {
  const dirs = nitro.options.scanDirs.map(dir => join(dir, name))
  const files = await scanDirs(dirs)
  const handlers: NitroEventHandler[] = files.map(mapper)
  return { dirs, files, handlers }
}

function scanDirs (dirs: string[]): Promise<FileInfo[]> {
  return Promise.all(dirs.map(async (dir) => {
    const fileNames = await globby(GLOB_SCAN_PATTERN, { cwd: dir, dot: true })
    return fileNames.map((fileName) => {
      return {
        dir,
        name: fileName
          .replace(/\.[a-z]+$/, '')
          .replace(/\/index$/, ''),
        path: resolve(dir, fileName)
      }
    }).sort((a, b) => b.path.localeCompare(a.path))
  })).then(r => r.flat())
}
