import { createWriteStream } from 'fs'
import archiver from 'archiver'
import { join, resolve } from 'pathe'
import { writeFile } from '../utils'
import { defineNitroPreset } from '../nitro'

// eslint-disable-next-line
export const azure_functions = defineNitroPreset({
  serveStatic: true,
  entry: '#nitro/entries/azure_functions',
  externals: true,
  commands: {
    deploy: 'az functionapp deployment source config-zip -g <resource-group> -n <app-name> --src {{ output.dir }}/deploy.zip'
  },
  hooks: {
    async 'nitro:compiled' (ctx: any) {
      await writeRoutes(ctx)
    }
  }
})

function zipDirectory (dir: string, outfile: string): Promise<undefined> {
  const archive = archiver('zip', { zlib: { level: 9 } })
  const stream = createWriteStream(outfile)

  return new Promise((resolve, reject) => {
    archive
      .directory(dir, false)
      .on('error', (err: Error) => reject(err))
      .pipe(stream)

    stream.on('close', () => resolve(undefined))
    archive.finalize()
  })
}

async function writeRoutes ({ output: { dir, serverDir } }) {
  const host = {
    version: '2.0',
    extensions: { http: { routePrefix: '' } }
  }

  const functionDefinition = {
    entryPoint: 'handle',
    bindings: [
      {
        authLevel: 'anonymous',
        type: 'httpTrigger',
        direction: 'in',
        name: 'req',
        route: '{*url}',
        methods: [
          'delete',
          'get',
          'head',
          'options',
          'patch',
          'post',
          'put'
        ]
      },
      {
        type: 'http',
        direction: 'out',
        name: 'res'
      }
    ]
  }

  await writeFile(resolve(serverDir, 'function.json'), JSON.stringify(functionDefinition))
  await writeFile(resolve(dir, 'host.json'), JSON.stringify(host))
  await zipDirectory(dir, join(dir, 'deploy.zip'))
}
