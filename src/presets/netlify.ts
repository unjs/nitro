import { existsSync, promises as fsp } from 'fs'
import { join } from 'pathe'
import { defineNitroPreset } from '../preset'
import type { Nitro } from '../types'

export const netlify = defineNitroPreset({
  extends: 'aws-lambda',
  output: {
    dir: '{{ rootDir }}/.netlify/functions-internal',
    publicDir: '{{ rootDir }}/dist'
  },
  hooks: {
    async 'compiled' (nitro: Nitro) {
      const redirectsPath = join(nitro.options.output.publicDir, '_redirects')
      let contents = '/* /.netlify/functions/server 200'
      if (existsSync(redirectsPath)) {
        const currentRedirects = await fsp.readFile(redirectsPath, 'utf-8')
        if (currentRedirects.match(/^\/\* /m)) {
          nitro.logger.info('Not adding Nitro fallback to `_redirects` (as an existing fallback was found).')
          return
        }
        nitro.logger.info('Adding Nitro fallback to `_redirects` to handle all unmatched routes.')
        contents = currentRedirects + '\n' + contents
      }
      await fsp.writeFile(redirectsPath, contents)
    },
    'rollup:before' (nitro: Nitro) {
      nitro.options.rollupConfig.output.entryFileNames = 'server.ts'
    }
  }
})

// eslint-disable-next-line
export const netlifyBuilder = defineNitroPreset({
  extends: 'netlify',
  entry: '#nitro/entries/netlify-builder'
})
