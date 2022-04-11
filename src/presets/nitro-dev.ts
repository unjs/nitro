import { pathToFileURL } from 'url'
import { isWindows } from 'std-env'
import { defineNitroPreset } from '../preset'

export const nitroDev = defineNitroPreset({
  extends: 'node',
  entry: '#nitro/entries/nitro-dev',
  output: {
    serverDir: '{{ buildDir }}/dev'
  },
  externals: { trace: false },
  inlineDynamicImports: true, // externals plugin limitation
  sourceMap: true,
  hooks: {
    'nitro:rollup:before' (nitro) {
      if (isWindows) {
        // Windows dynamic imports should be file:// url
        nitro.options.alias['#build'] = pathToFileURL(nitro.options.buildDir).href
      }
    }
  }
})
