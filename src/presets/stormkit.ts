import { defineNitroPreset } from '../preset'

export const stormkit = defineNitroPreset({
  entry: '#internal/nitro/entries/stormkit',
  externals: {},
  output: {
    dir: '{{ rootDir }}/.stormkit'
  }
})
