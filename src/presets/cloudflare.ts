import { resolve } from 'pathe'
import { writeFile } from '../utils'
import { defineNitroPreset } from '../nitro'
import type { Nitro } from '../types'

export const cloudflare = defineNitroPreset({
  extends: 'worker',
  entry: '#nitro/entries/cloudflare',
  ignore: [
    'wrangler.toml'
  ],
  commands: {
    preview: 'npx miniflare {{ options.output.serverDir }}/index.mjs --site {{ options.output.publicDir }}',
    deploy: 'cd {{ options.output.serverDir }} && npx wrangler publish'
  },
  hooks: {
    async 'nitro:compiled' (nitro: Nitro) {
      await writeFile(resolve(nitro.options.output.dir, 'package.json'), JSON.stringify({ private: true, main: './server/index.mjs' }, null, 2))
      await writeFile(resolve(nitro.options.output.dir, 'package-lock.json'), JSON.stringify({ lockfileVersion: 1 }, null, 2))
    }
  }
})
