import { defineNitroPreset } from '../preset'

export const server = defineNitroPreset({
  extends: 'node',
  entry: '#nitro/entries/server',
  serveStatic: true,
  commands: {
    preview: 'node {{ options.output.serverDir }}/index.mjs'
  }
})
