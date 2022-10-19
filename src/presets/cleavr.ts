import { defineNitroPreset } from '../preset'

export const cleavr = defineNitroPreset({
  entry: '#internal/nitro/entries/cleavr',
  extends: 'node-server'
})
