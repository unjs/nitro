import fse from 'fs-extra'
import { globby } from 'globby'
import { join, resolve } from 'pathe'
import { writeFile } from '../utils'
import { defineNitroPreset } from '../preset'
import type { Nitro } from '../types'

export const azure = defineNitroPreset({
  entry: '#nitro/entries/azure',
  externals: true,
  output: {
    serverDir: '{{ output.dir }}/server/functions'
  },
  commands: {
    preview: 'npx @azure/static-web-apps-cli start ./public --api-location ./server'
  },
  hooks: {
    async 'nitro:compiled' (ctx: Nitro) {
      await writeRoutes(ctx)
    }
  }
})

async function writeRoutes (nitro) {
  const host = {
    version: '2.0'
  }

  const config = {
    routes: [],
    navigationFallback: {
      rewrite: '/api/server'
    }
  }

  const indexPath = resolve(nitro.options.output.publicDir, 'index.html')
  const indexFileExists = fse.existsSync(indexPath)
  if (!indexFileExists) {
    config.routes.unshift(
      {
        route: '/index.html',
        redirect: '/'
      },
      {
        route: '/',
        rewrite: '/api/server'
      }
    )
  }

  const folderFiles = await globby([
    join(nitro.options.output.publicDir, 'index.html'),
    join(nitro.options.output.publicDir, '**/index.html')
  ])
  const prefix = nitro.options.output.publicDir.length
  const suffix = '/index.html'.length
  folderFiles.forEach(file =>
    config.routes.unshift({
      route: file.slice(prefix, -suffix) || '/',
      rewrite: file.slice(prefix)
    })
  )

  const otherFiles = await globby([join(nitro.options.output.publicDir, '**/*.html'), join(nitro.options.output.publicDir, '*.html')])
  otherFiles.forEach((file) => {
    if (file.endsWith('index.html')) {
      return
    }
    const route = file.slice(prefix, '.html'.length)
    const existingRouteIndex = config.routes.findIndex(_route => _route.route === route)
    if (existingRouteIndex > -1) {
      config.routes.splice(existingRouteIndex, 1)
    }
    config.routes.unshift(
      {
        route,
        rewrite: file.slice(prefix)
      }
    )
  })

  const functionDefinition = {
    entryPoint: 'handle',
    bindings: [
      {
        authLevel: 'anonymous',
        type: 'httpTrigger',
        direction: 'in',
        name: 'req',
        route: '{*url}',
        methods: ['delete', 'get', 'head', 'options', 'patch', 'post', 'put']
      },
      {
        type: 'http',
        direction: 'out',
        name: 'res'
      }
    ]
  }

  await writeFile(resolve(nitro.options.output.serverDir, 'function.json'), JSON.stringify(functionDefinition))
  await writeFile(resolve(nitro.options.output.serverDir, '../host.json'), JSON.stringify(host))
  await writeFile(resolve(nitro.options.output.publicDir, 'staticwebapp.config.json'), JSON.stringify(config))
  if (!indexFileExists) {
    await writeFile(indexPath, '')
  }
}
