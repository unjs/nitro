import { defineNitroPreset } from '../preset'

export const nitroPrerender = defineNitroPreset({
  extends: 'node',
  entry: '#nitro/entries/nitro-prerenderer',
  output: {
    serverDir: '{{ buildDir }}/prerender'
  },
  externals: { trace: false }
})
