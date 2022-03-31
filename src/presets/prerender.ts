import { defineNitroPreset } from '../preset'

export const prerender = defineNitroPreset({
  extends: 'node',
  entry: '#nitro/entries/node',
  output: {
    serverDir: '{{ buildDir }}/prerender'
  },
  externals: { trace: false }
})
