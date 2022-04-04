import { resolve } from 'pathe'
import { writeFile } from '../utils'
import { defineNitroPreset } from '../preset'
import type { Nitro } from '../types'

export const vercel = defineNitroPreset({
  extends: 'node',
  entry: '#nitro/entries/vercel',
  output: {
    dir: '{{ rootDir }}/.vercel_build_output',
    serverDir: '{{ output.dir }}/functions/node/server',
    publicDir: '{{ output.dir }}/static'
  },
  hooks: {
    async 'nitro:compiled' (nitro: Nitro) {
      await writeRoutes(nitro)
    }
  }
})

async function writeRoutes (nitro: Nitro) {
  const routes = [
    {
      src: '/sw.js',
      headers: {
        'cache-control': 'public, max-age=0, must-revalidate'
      },
      continue: true
    },
    {
      src: '/_nuxt/(.*)',
      headers: {
        'cache-control': 'public,max-age=31536000,immutable'
      },
      continue: true
    },
    {
      handle: 'filesystem'
    },
    {
      src: '(.*)',
      dest: '/.vercel/functions/server/index'
    }
  ]

  await writeFile(resolve(nitro.options.output.dir, 'config/routes.json'), JSON.stringify(routes, null, 2))
}
