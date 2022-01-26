import { defineNitroPreset } from '../nitro'

export const dev = defineNitroPreset({
  extends: 'node',
  entry: '#nitro/entries/dev',
  output: {
    serverDir: '{{ _nuxt.buildDir }}/nitro'
  },
  externals: { trace: false },
  inlineDynamicImports: true, // externals plugin limitation
  sourceMap: true
})
