import { fileURLToPath } from 'url'
import { dirname, resolve } from 'pathe'

let distDir = dirname(fileURLToPath(import.meta.url))
if (distDir.endsWith('chunks')) {
  distDir = dirname(distDir)
}
export const pkgDir = resolve(distDir, distDir.endsWith('/chunks') ? '../..' : '..')
export const runtimeDir = resolve(distDir, 'runtime')
