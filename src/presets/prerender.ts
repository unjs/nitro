import { defineNitroPreset } from '../preset'

export const prerender = defineNitroPreset({
  extends: 'node',
  entry: '#nitro/entries/node',
  output: {
    dir: '{{ buildDir }}/prerender'
  },
  externals: { trace: false }
})
