
import { defineNitroPreset } from '../nitro'

export const lambda = defineNitroPreset({
  entry: '#nitro/entries/lambda',
  externals: true
})
