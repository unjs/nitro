import { resolve } from 'pathe'
import { defu } from 'defu'
import { writeFile } from '../utils'
import { defineNitroPreset } from '../preset'
import type { Nitro } from '../types'

// https://vercel.com/docs/build-output-api/v3

export const vercel = defineNitroPreset({
  extends: 'node',
  entry: '#internal/nitro/entries/vercel',
  output: {
    dir: '{{ rootDir }}/.vercel/output',
    serverDir: '{{ output.dir }}/functions/index.func',
    publicDir: '{{ output.dir }}/static'
  },
  commands: {
    deploy: '',
    preview: ''
  },
  hooks: {
    async 'compiled' (nitro: Nitro) {
      const buildConfigPath = resolve(nitro.options.output.dir, 'config.json')
      const buildConfig = defu(nitro.options.vercel.config, {
        version: 3,
        routes: [
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
            dest: '/'
          }
        ]
      })
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
    serverDir: '{{ output.dir }}/functions/index.func',
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
      const buildConfig = defu(nitro.options.vercel.config, {
        version: 3,
        routes: [
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
            dest: '/'
          }
        ]
      })
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
