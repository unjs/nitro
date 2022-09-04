import { promises as fsp } from 'fs'
import zlib from 'node:zlib'
import { relative, resolve } from 'pathe'
import createEtag from 'etag'
import mime from 'mime'
import { globby } from 'globby'
import type { Plugin } from 'rollup'
import type { Nitro } from '../../types'
import { virtual } from './virtual'

export function publicAssets (nitro: Nitro): Plugin {
  return virtual({
    // #internal/nitro/virtual/public-assets-data
    '#internal/nitro/virtual/public-assets-data': async () => {
      const assets: Record<string, {
        type: string,
        etag: string,
        mtime: string,
        path: string,
        size: number,
        encoding?: string
      }> = {}
      const files = await globby('**', {
        cwd: nitro.options.output.publicDir,
        absolute: false,
        dot: true,
        ignore: ['*.gz', '*.br']
      })
      for (const id of files) {
        let type = mime.getType(id) || 'text/plain'
        const isTextType = type.startsWith('text')
        if (isTextType) { type += '; charset=utf-8' }
        const fullPath = resolve(nitro.options.output.publicDir, id)
        const assetData = await fsp.readFile(fullPath)
        const etag = createEtag(assetData)
        const stat = await fsp.stat(fullPath)

        const assetId = '/' + decodeURIComponent(id)
        assets[assetId] = {
          type,
          etag,
          mtime: stat.mtime.toJSON(),
          size: stat.size,
          path: relative(nitro.options.output.serverDir, fullPath)
        }

        if (!!nitro.options.compressPublicAssets && assetData.length > 1024 && !assetId.endsWith('.map') && isTypeCompressible(type)) {
          let encodings = []
          if (typeof nitro.options.compressPublicAssets === 'boolean') {
            encodings = ['gzip', 'br']
          } else {
            const { gzip, brotli } = nitro.options.compressPublicAssets
            if (gzip) { encodings.push('gzip') }
            if (brotli) { encodings.push('br') }
          }

          for (const encoding of encodings) {
            const suffix = '.' + (encoding === 'gzip' ? 'gz' : 'br')
            const compressedPath = fullPath + suffix
            const gzipOptions = { level: zlib.constants.Z_BEST_COMPRESSION }
            const brotliOptions = {
              [zlib.constants.BROTLI_PARAM_MODE]: isTextType
                ? zlib.constants.BROTLI_MODE_TEXT
                : zlib.constants.BROTLI_MODE_GENERIC,
              [zlib.constants.BROTLI_PARAM_QUALITY]: zlib.constants.BROTLI_MAX_QUALITY,
              [zlib.constants.BROTLI_PARAM_SIZE_HINT]: assetData.length
            }

            const compressedBuff: Buffer = await new Promise((resolve, reject) => {
              (encoding === 'gzip')
                ? zlib.gzip(assetData, gzipOptions, (error, result) => error ? reject(error) : resolve(result))
                : zlib.brotliCompress(assetData, brotliOptions, (error, result) => error ? reject(error) : resolve(result))
            })
            await fsp.writeFile(compressedPath, compressedBuff)
            assets[assetId + suffix] = {
              ...assets[assetId],
              encoding,
              size: compressedBuff.length,
              path: assets[assetId].path + suffix
            }
          }
        }
      }

      return `export default ${JSON.stringify(assets, null, 2)};`
    },
    // #internal/nitro/virtual/public-assets-node
    '#internal/nitro/virtual/public-assets-node': () => {
      return `
import { promises as fsp } from 'fs'
import { resolve } from 'pathe'
import { dirname } from 'pathe'
import { fileURLToPath } from 'url'
import assets from '#internal/nitro/virtual/public-assets-data'
export function readAsset (id) {
  const serverDir = dirname(fileURLToPath(import.meta.url))
  return fsp.readFile(resolve(serverDir, assets[id].path))
}`
    },
    // #internal/nitro/virtual/public-assets
    '#internal/nitro/virtual/public-assets': () => {
      const publicAssetBases = nitro.options.publicAssets
        .filter(dir => !dir.fallthrough && dir.baseURL !== '/')
        .map(dir => dir.baseURL)

      return `
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
    }
  }, nitro.vfs)
}

const isTypeCompressible = (type: string): boolean => {
  return [
    'application/javascript',
    'application/json',
    'application/manifest+json',
    'application/rss+xml',
    'application/vnd.ms-fontobject',
    'application/x-font-opentype',
    'application/x-font-truetype',
    'application/x-font-ttf',
    'application/x-javascript',
    'application/xml',
    'application/xhtml+xml',
    'font/eot',
    'font/opentype',
    'font/otf',
    'font/truetype',
    'image/svg+xml',
    'image/vnd.microsoft.icon',
    'image/x-icon',
    'image/x-win-bitmap',
    'text/css',
    'text/javascript',
    'text/plain',
    'text/xml',
    'text/x-component'
  ].includes(type)
}
