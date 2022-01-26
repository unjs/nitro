import { defineNitroPreset } from '../nitro'

export const worker = defineNitroPreset({
  entry: null, // Abstract
  node: false,
  minify: true,
  externals: false,
  inlineDynamicImports: true // iffe does not support code-splitting
})
