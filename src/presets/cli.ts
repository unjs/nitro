import consola from 'consola'
import { prettyPath } from '../utils'
import { defineNitroPreset } from '../nitro'

export const cli = defineNitroPreset({
  extends: 'node',
  entry: '#nitro/entries/cli',
  hooks: {
    'nitro:compiled' ({ output }: any) {
      consola.info('Run with `node ' + prettyPath(output.serverDir) + ' [route]`')
    }
  }
})
