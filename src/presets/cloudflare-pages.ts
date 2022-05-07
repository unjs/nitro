import { resolve } from 'pathe'
import { writeFile } from '../utils'
import { defineNitroPreset } from '../preset'
import type { Nitro } from '../types'

export const cloudflarePages = defineNitroPreset({
  extends: 'cloudflare',
  entry: '#internal/nitro/entries/cloudflare-pages',
  commands: {
    preview: 'npx wrangler2 ./server/_worker.js'
    // deployment is currently automatically done via GitHub/GitLab app
  },
  output: {
    publicDir: '.',
    serverDir: '.'
  },
  hooks: {
    async 'compiled' (nitro: Nitro) {
      await writeFile(resolve(nitro.options.output.dir, 'package.json'), JSON.stringify({ private: true, main: './server/_worker.js' }, null, 2))
      await writeFile(resolve(nitro.options.output.dir, 'package-lock.json'), JSON.stringify({ lockfileVersion: 1 }, null, 2))
    }
  }
})
