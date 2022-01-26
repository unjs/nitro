import consola from 'consola'
import { hl, prettyPath } from '../utils'
import { defineNitroPreset } from '../nitro'

export const server = defineNitroPreset({
  extends: 'node',
  entry: '#nitro/entries/server',
  serveStatic: true,
  hooks: {
    'nitro:compiled' (nitro) {
      // TODO: Use commands
      consola.success('Ready to run', hl('node ' + prettyPath(nitro.options.output.serverDir) + '/index.mjs'))
    }
  }
})
