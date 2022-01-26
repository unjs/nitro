import { defineNitroPreset } from '../nitro'

export const node = defineNitroPreset({
  entry: '#nitro/entries/node',
  externals: true
})
