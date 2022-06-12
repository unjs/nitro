import { defineNitroPreset } from '../preset'

export const stormkit = defineNitroPreset({
  entry: '#internal/nitro/entries/stormkit',
  output: {
    dir: '{{ rootDir }}/.stormkit'
  }
})
