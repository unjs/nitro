import { defineNitroPreset } from '../preset'

export const dev = defineNitroPreset({
  extends: 'node',
  entry: '#nitro/entries/dev',
  output: {
    serverDir: '{{ buildDir }}/nitro-dev'
  },
  externals: { trace: false },
  inlineDynamicImports: true, // externals plugin limitation
  sourceMap: true
})
