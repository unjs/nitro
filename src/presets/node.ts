import { defineNitroPreset } from '../preset'

export const node = defineNitroPreset({
  entry: '#nitro/entries/node',
  externals: true
})
