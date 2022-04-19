import { defineNitroPreset } from '../preset'

export const stormkit = defineNitroPreset({
  entry: '#internal/nitro/entries/stormkit',
  externals: true,
  output: {
    dir: '{{ rootDir }}/.stormkit'
  }
})
