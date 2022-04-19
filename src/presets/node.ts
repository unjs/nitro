import { defineNitroPreset } from '../preset'

export const node = defineNitroPreset({
  entry: '#internal/nitro/entries/node',
  externals: true
})
