import { resolve } from 'pathe'
import { writeFile } from '../utils'
import { defineNitroPreset } from '../preset'

export const vercel = defineNitroPreset({
  extends: 'node',
  entry: '#nitro/entries/vercel',
  output: {
    dir: '{{ options.rootDir }}/.vercel_build_output',
    serverDir: '{{ output.dir }}/functions/node/server',
    publicDir: '{{ output.dir }}/static'
  },
  ignore: [
    'vercel.json'
  ],
  hooks: {
    async 'nitro:compiled' (ctx: any) {
      await writeRoutes(ctx)
    }
  }
})

async function writeRoutes ({ output }) {
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

  await writeFile(resolve(output.dir, 'config/routes.json'), JSON.stringify(routes, null, 2))
}
