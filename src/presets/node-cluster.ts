import { defineNitroPreset } from '../preset'

export const nodeServer = defineNitroPreset({
  extends: 'node',
  entry: '#internal/nitro/entries/node-cluster',
  serveStatic: true,
  commands: {
    preview: 'node ./server/node-cluster.index.mjs'
  }
})
