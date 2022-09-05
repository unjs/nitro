import os from 'node:os'
import cluster from 'node:cluster'

if (cluster.isPrimary) {
  const numCPUs = os.cpus().length
  for (let i = 0; i < numCPUs; i++) {
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
