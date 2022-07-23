import { move } from 'fs-extra'
import { resolve } from 'pathe'
import { defineNitroPreset } from '../preset'
import type { Nitro } from '../types'

export const cloudflarePages = defineNitroPreset({
  extends: 'cloudflare',
  entry: '#internal/nitro/entries/cloudflare-pages',
  commands: {
    preview: 'npx wrangler pages dev .output/public',
    deploy: 'npx wrangler pages publish .output/public'
  },
  output: {
    serverDir: '{{ rootDir }}/functions'
  },
  rollupConfig: {
    output: {
      entryFileNames: 'path.js',
      format: 'esm'
    }
  },
  hooks: {
    async 'compiled' (nitro: Nitro) {
      await move(resolve(nitro.options.output.serverDir, 'path.js'), resolve(nitro.options.output.serverDir, '[[path]].js'))
      await move(resolve(nitro.options.output.serverDir, 'path.js.map'), resolve(nitro.options.output.serverDir, '[[path]].js.map'))
    }
  }
})
