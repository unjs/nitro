import { defineNitroPreset } from '../preset'

export const nodeServer = defineNitroPreset({
  extends: 'node',
  entry: '#nitro/entries/server',
  serveStatic: true,
  commands: {
    preview: 'node ./server/index.mjs'
  }
})
