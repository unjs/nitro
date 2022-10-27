import { eventHandler, createError } from 'h3'
import { joinURL, withoutTrailingSlash, withLeadingSlash, parseURL } from 'ufo'
import { getAsset, readAsset, isPublicAssetURL } from '#internal/nitro/virtual/public-assets'

const METHODS = ['HEAD', 'GET']

const EncodingMap = { gzip: '.gz', br: '.br' }

export default eventHandler(async (event) => {
  if (event.req.method && !METHODS.includes(event.req.method)) {
    return
  }

  let id = decodeURIComponent(withLeadingSlash(withoutTrailingSlash(parseURL(event.req.url).pathname)))
  let asset

  const encodingHeader = String(event.req.headers['accept-encoding'] || '')
  const encodings = encodingHeader.split(',')
    .map(e => EncodingMap[e.trim()])
    .filter(Boolean)
    .sort()
    .concat([''])
  if (encodings.length > 1) {
    event.res.setHeader('Vary', 'Accept-Encoding')
  }

  for (const encoding of encodings) {
    for (const _id of [id + encoding, joinURL(id, 'index.html' + encoding)]) {
      const _asset = getAsset(_id)
      if (_asset) {
        asset = _asset
        id = _id
        break
      }
    }
  }

  if (!asset) {
    if (isPublicAssetURL(id)) {
      throw createError({
        statusMessage: 'Cannot find static asset ' + id,
        statusCode: 404
      })
    }
    return
  }

  const ifNotMatch = event.req.headers['if-none-match'] === asset.etag
  if (ifNotMatch) {
    event.res.statusCode = 304
    event.res.end()
    return
  }

  const ifModifiedSinceH = event.req.headers['if-modified-since']
  if (ifModifiedSinceH && asset.mtime) {
    if (new Date(ifModifiedSinceH) >= new Date(asset.mtime)) {
      event.res.statusCode = 304
      event.res.end()
      return
    }
  }

  if (asset.type && !event.res.getHeader('Content-Type')) {
    event.res.setHeader('Content-Type', asset.type)
  }

  if (asset.etag && !event.res.getHeader('ETag')) {
    event.res.setHeader('ETag', asset.etag)
  }

  if (asset.mtime && !event.res.getHeader('Last-Modified')) {
    event.res.setHeader('Last-Modified', asset.mtime)
  }

  if (asset.encoding && !event.res.getHeader('Content-Encoding')) {
    event.res.setHeader('Content-Encoding', asset.encoding)
  }

  if (asset.size && !event.res.getHeader('Content-Length')) {
    event.res.setHeader('Content-Length', asset.size)
  }

  // TODO: Asset dir cache control
  // if (isBuildAsset) {
  // const TWO_DAYS = 2 * 60 * 60 * 24
  // event.res.setHeader('Cache-Control', `max-age=${TWO_DAYS}, immutable`)
  // }

  return readAsset(id)
})
