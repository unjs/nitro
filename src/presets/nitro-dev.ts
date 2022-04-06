import { defineNitroPreset } from '../preset'

export const nitroDev = defineNitroPreset({
  extends: 'node',
  entry: '#nitro/entries/nitro-dev',
  output: {
    serverDir: '{{ buildDir }}/dev'
  },
  externals: { trace: false },
  inlineDynamicImports: true, // externals plugin limitation
  sourceMap: true
})
