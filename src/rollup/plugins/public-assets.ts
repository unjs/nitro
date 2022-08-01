import { readFileSync, statSync } from 'fs'
import createEtag from 'etag'
import mime from 'mime'
import { relative, resolve } from 'pathe'
import { globbySync } from 'globby'
import type { Plugin } from 'rollup'
import type { Nitro } from '../../types'
import { virtual } from './virtual'

export function publicAssets (nitro: Nitro): Plugin {
  const assets: Record<string, { type: string, etag: string, mtime: string, path: string }> = {}

  const files = globbySync('**/*.*', { cwd: nitro.options.output.publicDir, absolute: false, dot: true })

  const publicAssetBases = nitro.options.publicAssets
    .filter(dir => !dir.fallthrough && dir.baseURL !== '/')
    .map(dir => dir.baseURL)

  for (const id of files) {
    // @ts-ignore
    let type = mime.getType(id) || 'text/plain'
    if (type.startsWith('text')) { type += '; charset=utf-8' }
    const fullPath = resolve(nitro.options.output.publicDir, id)
    const etag = createEtag(readFileSync(fullPath))
    const stat = statSync(fullPath)

    assets['/' + decodeURIComponent(id)] = {
      type,
      etag,
      mtime: stat.mtime.toJSON(),
      path: relative(nitro.options.output.serverDir, fullPath)
    }
  }

  return virtual({
    '#internal/nitro/virtual/public-assets-data': `export default ${JSON.stringify(assets, null, 2)};`,
    '#internal/nitro/virtual/public-assets-node': `
import { promises as fsp } from 'fs'
import { resolve } from 'pathe'
import { dirname } from 'pathe'
import { fileURLToPath } from 'url'
import assets from '#internal/nitro/virtual/public-assets-data'
export function readAsset (id) {
  const serverDir = dirname(fileURLToPath(import.meta.url))
  return fsp.readFile(resolve(serverDir, assets[id].path))
}`,
    '#internal/nitro/virtual/public-assets': `
import assets from '#internal/nitro/virtual/public-assets-data'
${nitro.options.serveStatic ? 'export * from "#internal/nitro/virtual/public-assets-node"' : 'export const readAsset = () => Promise(null)'}

export const publicAssetBases = ${JSON.stringify(publicAssetBases)}

export function isPublicAssetURL(id = '') {
  if (assets[id]) {
    return true
  }
  for (const base of publicAssetBases) {
    if (id.startsWith(base)) { return true }
  }
  return false
}

export function getAsset (id) {
  return assets[id]
}
`
  }, nitro.vfs)
}
