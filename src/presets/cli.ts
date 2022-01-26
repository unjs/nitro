import { defineNitroPreset } from '../nitro'

export const cli = defineNitroPreset({
  extends: 'node',
  entry: '#nitro/entries/cli',
  commands: {
    preview: 'Run with node {{ options.serverDir }} [route]'
  }
})
