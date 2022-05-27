import { defineNitroPreset } from '../preset'

export const nodeHttp2 = defineNitroPreset({
  extends: 'node',
  entry: '#internal/nitro/entries/node-http2',
  serveStatic: true,
  commands: {
    preview: 'node ./server/index.mjs'
  }
})
