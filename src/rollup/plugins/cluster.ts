import { Nitro } from 'nitropack'
import { virtual } from './virtual'

export function cluster(nitro: Nitro) {
  return virtual({
    '#internal/nitro/entries/node-cluster': () => {
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
    process.cwd()
    import(resolve('.', 'server', 'index.mjs'))
  }
}
  `.trim()
    }
  }, nitro.vfs)
}
