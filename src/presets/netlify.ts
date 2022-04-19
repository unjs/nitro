import { existsSync, promises as fsp } from 'fs'
import { join, dirname } from 'pathe'
import { defineNitroPreset } from '../preset'
import type { Nitro } from '../types'

// Netlify functions
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

// Netlify builder
export const netlifyBuilder = defineNitroPreset({
  extends: 'netlify',
  entry: '#internal/nitro/entries/netlify-builder'
})

// Netlify edge
export const netlifyEdge = defineNitroPreset({
  extends: 'base-worker',
  entry: '#internal/nitro/entries/netlify-edge',
  output: {
    serverDir: '{{ rootDir }}/.netlify/edge-functions',
    publicDir: '{{ rootDir }}/dist'
  },
  hooks: {
    async 'compiled' (nitro: Nitro) {
      const manifest = {
        version: 1,
        functions: [
          {
            function: 'server',
            pattern: '/*'
          }
        ]
      }
      const manifestPath = join(nitro.options.rootDir, '.netlify/edge-functions/manifest.json')
      await fsp.mkdir(dirname(manifestPath), { recursive: true })
      await fsp.writeFile(manifestPath, JSON.stringify(manifest, null, 2))
    },
    'rollup:before' (nitro: Nitro) {
      nitro.options.rollupConfig.output.entryFileNames = 'server.js'
    }
  }
})
