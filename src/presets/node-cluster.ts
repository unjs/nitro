import { defineNitroPreset } from '../preset'
import { dirname, resolve } from 'pathe'
import { promises as fsp } from 'fs'

export const nodeCluster = defineNitroPreset({
  extends: 'node',
  entry: '#internal/nitro/entries/node-cluster',
  serveStatic: true,
  output: {
    dir: '{{ buildDir }}'
  },
  commands: {
    preview: 'node ./server/node-cluster.index.mjs'
  },
  hooks: {
    async 'compiled' (nitro) {
      const path = resolve(nitro.options.output.dir, 'server', 'node-cluster.index.mjs')
      await writeFile(path, entryTemplate())
    }
  }
})

function entryTemplate () {
  return `
import os from 'node:os'
import cluster from 'node:cluster'
import { resolve } from 'pathe'

export async function prod(port) {
  const numCPUs = os.cpus().length
  if (cluster.isPrimary) {
    for (let i = 0; i < numCPUs; i++) {
      cluster.fork()
    }
    cluster.on('exit', (worker, code, signal) => {
      cluster.fork()
    })
  } else {
    import(resolve('.', 'server', 'index.mjs'))
  }
}
  `.trim()
}

async function writeFile (path: string, contents: string) {
  await fsp.mkdir(dirname(path), { recursive: true })
  await fsp.writeFile(path, contents, 'utf-8')
}
