import { resolve } from 'pathe'
import { writeFile } from '../utils'
import { defineNitroPreset } from '../nitro'

export const cloudflare = defineNitroPreset({
  extends: 'worker',
  entry: '#nitro/entries/cloudflare',
  ignore: [
    'wrangler.toml'
  ],
  commands: {
    preview: 'npx miniflare {{ output.serverDir }}/index.mjs --site {{ output.publicDir }}',
    deploy: 'cd {{ output.serverDir }} && npx wrangler publish'
  },
  hooks: {
    async 'nitro:compiled' ({ output }: any) {
      await writeFile(resolve(output.dir, 'package.json'), JSON.stringify({ private: true, main: './server/index.mjs' }, null, 2))
      await writeFile(resolve(output.dir, 'package-lock.json'), JSON.stringify({ lockfileVersion: 1 }, null, 2))
    }
  }
})
