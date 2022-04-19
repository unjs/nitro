import { defineNitroPreset } from '../preset'

export const cli = defineNitroPreset({
  extends: 'node',
  entry: '#internal/nitro/entries/cli',
  commands: {
    preview: 'Run with node ./server/index.mjs [route]'
  }
})
