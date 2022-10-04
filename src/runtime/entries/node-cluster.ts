import os from 'node:os'
import cluster from 'node:cluster'

if (cluster.isPrimary) {
  const numberOfWorkers = parseInt(process.env.NITRO_CLUSTER_WORKERS) || os.cpus().length
  for (let i = 0; i < numberOfWorkers; i++) {
    cluster.fork()
  }
  cluster.on('exit', () => {
    cluster.fork()
  })
} else {
  import('./node-server').catch((error) => {
    console.error(error)
    process.exit(1)
  })
}
