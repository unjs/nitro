import os from 'node:os'
import cluster from 'node:cluster'
import { resolve } from 'pathe'

const numCPUs = os.cpus().length
if (cluster.isPrimary) {
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork()
  }
  cluster.on('exit', (worker, code, signal) => {
    cluster.fork()
  })
} else {
  const buildOutputDir = '.'
  import(resolve(buildOutputDir, 'server', 'index.mjs'))
}
