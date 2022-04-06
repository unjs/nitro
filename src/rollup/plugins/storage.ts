import virtual from '@rollup/plugin-virtual'
import { serializeImportName } from '../../utils'

export interface StorageMounts {
  [path: string]: {
    driver: 'fs' | 'http' | 'memory' | 'redis' | 'cloudflare-kv',
    [option: string]: any
  }
}

export interface StorageOptions {
  mounts: StorageMounts
}

const drivers = {
  fs: 'unstorage/drivers/fs',
  http: 'unstorage/drivers/http',
  memory: 'unstorage/drivers/memory',
  redis: 'unstorage/drivers/redis',
  'cloudflare-kv': 'unstorage/drivers/cloudflare-kv'
}

export function storage (opts: StorageOptions) {
  const mounts: { path: string, driver: string, opts: object }[] = []

  for (const path in opts.mounts) {
    const mount = opts.mounts[path]
    mounts.push({
      path,
      driver: drivers[mount.driver] || mount.driver,
      opts: mount
    })
  }

  const driverImports = Array.from(new Set(mounts.map(m => m.driver)))

  return virtual({
    '#nitro/virtual/storage': `
import { createStorage } from 'unstorage'
import { assets } from '#nitro/virtual/server-assets'

${driverImports.map(i => `import ${serializeImportName(i)} from '${i}'`).join('\n')}

const storage = createStorage({})

export const useStorage = () => storage

storage.mount('/assets', assets)

${mounts.map(m => `storage.mount('${m.path}', ${serializeImportName(m.driver)}(${JSON.stringify(m.opts)}))`).join('\n')}
`
  })
}
