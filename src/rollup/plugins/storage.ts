import virtual from '@rollup/plugin-virtual'
import { serializeImportName } from '../../utils'
import { builtinDrivers } from '../../storage'
import type { StorageMounts } from '../../types'

export interface StorageOptions {
  mounts: StorageMounts
}

export function storage (opts: StorageOptions) {
  const mounts: { path: string, driver: string, opts: object }[] = []

  for (const path in opts.mounts) {
    const mount = opts.mounts[path]
    mounts.push({
      path,
      driver: builtinDrivers[mount.driver] || mount.driver,
      opts: mount
    })
  }

  const driverImports = Array.from(new Set(mounts.map(m => m.driver)))

  return virtual({
    '#internal/nitro/virtual/storage': `
import { createStorage } from 'unstorage'
import { assets } from '#internal/nitro/virtual/server-assets'

${driverImports.map(i => `import ${serializeImportName(i)} from '${i}'`).join('\n')}

const storage = createStorage({})

export const useStorage = () => storage

storage.mount('/assets', assets)

storage.getKeys('/assets/nitro/snapshot').then(console.log)

${mounts.map(m => `storage.mount('${m.path}', ${serializeImportName(m.driver)}(${JSON.stringify(m.opts)}))`).join('\n')}
`
  })
}
