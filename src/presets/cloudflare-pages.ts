import { move } from 'fs-extra'
import { resolve } from 'pathe'
import { writeFile } from '../utils'
import { defineNitroPreset } from '../preset'
import type { Nitro } from '../types'

export const cloudflarePages = defineNitroPreset({
  extends: 'cloudflare',
  entry: '#internal/nitro/entries/cloudflare-pages',
  commands: {
    preview: 'npx wrangler pages dev',
    deploy: 'npx wrangler pages publish .output/public'
  },
  output: {
    serverDir: '{{ rootDir }}/functions'
  },
  hooks: {
    async 'compiled' (nitro: Nitro) {
      await writeFile(resolve(nitro.options.output.dir, 'package.json'), JSON.stringify({ private: true, main: './functions/[[path]].js' }, null, 2))
      await writeFile(resolve(nitro.options.output.dir, 'package-lock.json'), JSON.stringify({ lockfileVersion: 1 }, null, 2))
      await move(resolve(nitro.options.output.serverDir, 'index.mjs'), resolve(nitro.options.output.serverDir, '[[path]].js'))
      await move(resolve(nitro.options.output.serverDir, 'index.mjs.map'), resolve(nitro.options.output.serverDir, '[[path]].js.map'))
    }
  }
})
