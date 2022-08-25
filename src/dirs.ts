import { fileURLToPath } from 'url'
import { dirname, resolve } from 'pathe'

let distDir = dirname(fileURLToPath(import.meta.url))
if (/(chunks|shared)$/.test(distDir)) {
  distDir = dirname(distDir)
}
export const pkgDir = resolve(distDir, '..')
export const runtimeDir = resolve(distDir, 'runtime')
