import zlib from 'node:zlib'
import fsp from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { globby } from 'globby'
import { resolve } from 'pathe'
import mime from 'mime'
import type { Nitro } from './types'

export async function compressPublicAssets (nitro: Nitro) {
  const publicFiles = await globby('**', {
    cwd: nitro.options.output.publicDir,
    absolute: false,
    dot: true,
    ignore: ['*.gz', '*.br']
  })

  for (const fileName of publicFiles) {
    const filePath = resolve(nitro.options.output.publicDir, fileName)
    const fileContents = await fsp.readFile(filePath)
    if (existsSync(filePath + '.gz') || existsSync(filePath + '.br')) {
      continue
    }

    const mimeType = mime.getType(fileName) || 'text/plain'

    if (fileContents.length < 1024 || fileName.endsWith('.map') || !isCompressable(mimeType)) {
      // console.log('Skipping compression for', fileName, fileContents.length, mimeType)
      continue
    }

    const { gzip, brotli } = nitro.options.compressPublicAssets || {} as any

    const encodings = [gzip !== false && 'gzip', brotli !== false && 'br'].filter(Boolean)

    for (const encoding of encodings) {
      const suffix = '.' + (encoding === 'gzip' ? 'gz' : 'br')
      const compressedPath = filePath + suffix
      if (existsSync(compressedPath)) { continue }
      const gzipOptions = { level: zlib.constants.Z_BEST_COMPRESSION }
      const isTextType = mimeType.startsWith('text')
      const brotliOptions = {
        [zlib.constants.BROTLI_PARAM_MODE]: isTextType ? zlib.constants.BROTLI_MODE_TEXT : zlib.constants.BROTLI_MODE_GENERIC,
        [zlib.constants.BROTLI_PARAM_QUALITY]: zlib.constants.BROTLI_MAX_QUALITY,
        [zlib.constants.BROTLI_PARAM_SIZE_HINT]: fileContents.length
      }
      const compressedBuff: Buffer = await new Promise((resolve, reject) => {
        const cb = (error, result: Buffer) => error ? reject(error) : resolve(result)
        if (encoding === 'gzip') {
          zlib.gzip(fileContents, gzipOptions, cb)
        } else {
          zlib.brotliCompress(fileContents, brotliOptions, cb)
        }
      })
      await fsp.writeFile(compressedPath, compressedBuff)
    }
  }
}

function isCompressable (mimeType: string) {
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
    'text/html',
    'text/xml',
    'text/x-component'
  ].includes(mimeType)
}
