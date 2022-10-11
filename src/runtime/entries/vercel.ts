import '#internal/nitro/virtual/polyfill'
import { toNodeListener, NodeListener } from 'h3'
import { parseQuery } from 'ufo'
import { nitroApp } from '../app'

const handler = toNodeListener(nitroApp.h3App)

export default <NodeListener> function (req, res) {
  const { url } = parseQuery(req.headers['x-now-route-matches'] as string)
  if (url) {
    req.url = url as string
  }
  return handler(req, res)
}
