import { defineNitroPreset } from '../preset'

export const lambda = defineNitroPreset({
  entry: '#nitro/entries/lambda',
  externals: true
})
