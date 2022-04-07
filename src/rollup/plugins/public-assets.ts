import { readFileSync, statSync } from 'fs'
import createEtag from 'etag'
import mime from 'mime'
import { relative, resolve } from 'pathe'
import virtual from '@rollup/plugin-virtual'
import { globbySync } from 'globby'
import type { Plugin } from 'rollup'
import type { Nitro } from '../../types'

export function publicAssets (nitro: Nitro): Plugin {
  const assets: Record<string, { type: string, etag: string, mtime: string, path: string }> = {}

  const files = globbySync('**/*.*', { cwd: nitro.options.output.publicDir, absolute: false })

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
    '#nitro/virtual/public-assets-data': `export default ${JSON.stringify(assets, null, 2)};`,
    '#nitro/virtual/public-assets': `
import { promises } from 'fs'
import { resolve } from 'pathe'
import { dirname } from 'pathe'
import { fileURLToPath } from 'url'
import assets from '#nitro/virtual/public-assets-data'

const mainDir = dirname(fileURLToPath(globalThis.entryURL))

export const publicAssetBases = ${JSON.stringify(publicAssetBases)}

export function isPublicAssetURL(id = '') {
  if (assets[id]) {
    return
  }

  for (const base of publicAssetBases) {
    if (id.startsWith(base)) { return true }
  }

  return false
}

export function readAsset (id) {
  return promises.readFile(resolve(mainDir, getAsset(id).path)).catch(() => {})
}

export function getAsset (id) {
  return assets[id]
}
`
  })
}
