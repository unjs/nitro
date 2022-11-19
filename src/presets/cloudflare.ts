import { resolve } from 'pathe'
import { move } from 'fs-extra'
import { writeFile } from '../utils'
import { defineNitroPreset } from '../preset'
import type { Nitro } from '../types'

export const cloudflare = defineNitroPreset({
  extends: 'base-worker',
  entry: '#internal/nitro/entries/cloudflare',
  commands: {
    preview: 'npx wrangler dev ./server/index.mjs --site ./public --local',
    deploy: 'npx wrangler publish'
  },
  hooks: {
    async 'compiled' (nitro: Nitro) {
      await writeFile(resolve(nitro.options.output.dir, 'package.json'), JSON.stringify({ private: true, main: './server/index.mjs' }, null, 2))
      await writeFile(resolve(nitro.options.output.dir, 'package-lock.json'), JSON.stringify({ lockfileVersion: 1 }, null, 2))
    }
  }
})

export const cloudflareEsm = defineNitroPreset({
  extends: 'base-worker',
  entry: '#internal/nitro/entries/cloudflare-esm',
  commands: {
    preview: 'npx wrangler dev ./server/index.mjs --site ./public --local',
    deploy: 'npx wrangler publish'
  },
  rollupConfig: {
    external: '__STATIC_CONTENT_MANIFEST',
    output: {
      format: 'esm'
    }
  },
  hooks: {
    async 'compiled' (nitro: Nitro) {
      await writeFile(resolve(nitro.options.output.dir, 'package.json'), JSON.stringify({ private: true, main: './server/index.mjs' }, null, 2))
      await writeFile(resolve(nitro.options.output.dir, 'package-lock.json'), JSON.stringify({ lockfileVersion: 1 }, null, 2))
    }
  }
})

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
