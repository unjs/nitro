import { defineNitroPreset } from '../preset'

export const baseWorker = defineNitroPreset({
  entry: null, // Abstract
  node: false,
  minify: true,
  externals: false,
  inlineDynamicImports: true // iffe does not support code-splitting
})
