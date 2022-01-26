import { existsSync, promises as fsp } from 'fs'
import { join } from 'pathe'
import consola from 'consola'
import { defineNitroPreset } from '../nitro'
import type { Nitro } from '../types'

export const netlify = defineNitroPreset({
  extends: 'lambda',
  output: {
    dir: '{{ options.rootDir }}/.netlify/functions-internal',
    publicDir: '{{ options.rootDir }}/dist'
  },
  hooks: {
    async 'nitro:compiled' (nitro: Nitro) {
      const redirectsPath = join(nitro.options.output.publicDir, '_redirects')
      let contents = '/* /.netlify/functions/server 200'
      if (existsSync(redirectsPath)) {
        const currentRedirects = await fsp.readFile(redirectsPath, 'utf-8')
        if (currentRedirects.match(/^\/\* /m)) {
          consola.info('Not adding Nitro fallback to `_redirects` (as an existing fallback was found).')
          return
        }
        consola.info('Adding Nitro fallback to `_redirects` to handle all unmatched routes.')
        contents = currentRedirects + '\n' + contents
      }
      await fsp.writeFile(redirectsPath, contents)
    },
    'nitro:rollup:before' (nitro: Nitro) {
      nitro.options.rollupConfig.output.entryFileNames = 'server.ts'
    }
  },
  ignore: [
    'netlify.toml',
    '_redirects'
  ]
})

// eslint-disable-next-line
export const netlify_builder = defineNitroPreset({
  extends: netlify,
  entry: '#nitro/entries/netlify_builder'
})
