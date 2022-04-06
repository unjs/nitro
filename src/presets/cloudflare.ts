import { resolve } from 'pathe'
import { writeFile } from '../utils'
import { defineNitroPreset } from '../preset'
import type { Nitro } from '../types'

export const cloudflare = defineNitroPreset({
  extends: 'base-worker',
  entry: '#nitro/entries/cloudflare',
  commands: {
    preview: 'npx miniflare ./server/index.mjs --site ./public',
    deploy: 'cd ./server && npx wrangler publish'
  },
  hooks: {
    async 'nitro:compiled' (nitro: Nitro) {
      await writeFile(resolve(nitro.options.output.dir, 'package.json'), JSON.stringify({ private: true, main: './server/index.mjs' }, null, 2))
      await writeFile(resolve(nitro.options.output.dir, 'package-lock.json'), JSON.stringify({ lockfileVersion: 1 }, null, 2))
    }
  }
})
