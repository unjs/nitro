import { resolve } from 'pathe'
import { defu } from 'defu'
import { withoutLeadingSlash } from 'ufo'
import { writeFile } from '../utils'
import { defineNitroPreset } from '../preset'
import type { Nitro } from '../types'
import type { VercelBuildConfigV3 } from '../types/presets'

// https://vercel.com/docs/build-output-api/v3

export const vercel = defineNitroPreset({
  extends: 'node',
  entry: '#internal/nitro/entries/vercel',
  output: {
    dir: '{{ rootDir }}/.vercel/output',
    serverDir: '{{ output.dir }}/functions/__nitro.func',
    publicDir: '{{ output.dir }}/static'
  },
  commands: {
    deploy: '',
    preview: ''
  },
  hooks: {
    async 'compiled' (nitro: Nitro) {
      const buildConfigPath = resolve(nitro.options.output.dir, 'config.json')
      const buildConfig = generateBuildConfig(nitro)
      await writeFile(buildConfigPath, JSON.stringify(buildConfig, null, 2))

      const functionConfigPath = resolve(nitro.options.output.serverDir, '.vc-config.json')
      const functionConfig = {
        runtime: 'nodejs16.x',
        handler: 'index.mjs',
        launcherType: 'Nodejs',
        shouldAddHelpers: false
      }
      await writeFile(functionConfigPath, JSON.stringify(functionConfig, null, 2))
    }
  }
})

export const vercelEdge = defineNitroPreset({
  extends: 'base-worker',
  entry: '#internal/nitro/entries/vercel-edge',
  output: {
    dir: '{{ rootDir }}/.vercel/output',
    serverDir: '{{ output.dir }}/functions/__nitro.func',
    publicDir: '{{ output.dir }}/static'
  },
  commands: {
    deploy: '',
    preview: ''
  },
  rollupConfig: {
    output: {
      format: 'module'
    }
  },
  hooks: {
    async 'compiled' (nitro: Nitro) {
      const buildConfigPath = resolve(nitro.options.output.dir, 'config.json')
      const buildConfig = generateBuildConfig(nitro)
      await writeFile(buildConfigPath, JSON.stringify(buildConfig, null, 2))

      const functionConfigPath = resolve(nitro.options.output.serverDir, '.vc-config.json')
      const functionConfig = {
        runtime: 'edge',
        entrypoint: 'index.mjs'
      }
      await writeFile(functionConfigPath, JSON.stringify(functionConfig, null, 2))
    }
  }
})

function generateBuildConfig (nitro: Nitro) {
  // const overrides = generateOverrides(nitro._prerenderedRoutes?.filter(r => r.fileName !== r.route) || [])
  return defu(nitro.options.vercel?.config, <VercelBuildConfigV3> {
    version: 3,
    overrides: Object.fromEntries(
      (nitro._prerenderedRoutes?.filter(r => r.fileName !== r.route) || [])
        .map(({ route, fileName }) =>
          [withoutLeadingSlash(fileName), { path: route.replace(/^\//, '') }]
        )
    ),
    routes: [
      ...Object.entries(nitro.options.routes).filter(([_, value]) => value.redirect || value.headers || value.cors).map(([key, value]) => {
        let route = {
          src: key.replace('/**', '/.*')
        }
        if (value.redirect) {
          const redirect = typeof value.redirect === 'string' ? { to: value.redirect } : value.redirect
          route = defu(route, {
            status: redirect.statusCode || 307,
            headers: { Location: redirect.to }
          })
        }
        if (value.cors) {
          route = defu(route, {
            headers: {
              'access-control-allow-origin': '*',
              'access-control-allowed-methods': '*',
              'access-control-allow-headers': '*',
              'access-control-max-age': '0'
            }
          })
        }
        if (value.headers) {
          route = defu(route, {
            headers: value.headers
          })
        }
        return route
      }),
      ...nitro.options.publicAssets
        .filter(asset => !asset.fallthrough)
        .map(asset => asset.baseURL)
        .map(baseURL => ({
          src: baseURL + '(.*)',
          headers: {
            'cache-control': 'public,max-age=31536000,immutable'
          },
          continue: true
        })),
      {
        handle: 'filesystem'
      },
      {
        src: '/(.*)',
        dest: '/__nitro'
      }
    ]
  })
}
