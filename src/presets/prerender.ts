import { defineNitroPreset } from '../preset'

export const prerender = defineNitroPreset({
  extends: 'node',
  entry: '#nitro/entries/node',
  output: {
    serverDir: '{{ buildDir }}/nitro-prerender'
  },
  externals: { trace: false }
})
