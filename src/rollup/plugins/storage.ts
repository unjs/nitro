import virtual from '@rollup/plugin-virtual'
import { serializeImportName } from '../../utils'
import { builtinDrivers } from '../../storage'
import type { Nitro, StorageMounts } from '../../types'

export interface StorageOptions {
  mounts: StorageMounts
}

export function storage (nitro: Nitro) {
  const mounts: { path: string, driver: string, opts: object }[] = []

  for (const path in nitro.options.storage) {
    const mount = nitro.options.storage[path]
    mounts.push({
      path,
      driver: builtinDrivers[mount.driver] || mount.driver,
      opts: mount
    })
  }

  const driverImports = Array.from(new Set(mounts.map(m => m.driver)))

  const bundledStorageCode = `
import overlay from 'unstorage/drivers/overlay'
import memory from 'unstorage/drivers/memory'

const bundledStorage = ${JSON.stringify(nitro.options.bundledStorage)}
for (const base of bundledStorage) {
  storage.mount(base, overlay({
    layers: [
      memory(),
      // TODO
      // prefixStorage(storage, base),
      prefixStorage(storage, '/assets/nitro/bundled' + base)
    ]
  }))
}`

  return virtual({
    '#internal/nitro/virtual/storage': `
import { createStorage } from 'unstorage'
import { assets } from '#internal/nitro/virtual/server-assets'

${driverImports.map(i => `import ${serializeImportName(i)} from '${i}'`).join('\n')}

const storage = createStorage({})

export const useStorage = () => storage

storage.mount('/assets', assets)

${mounts.map(m => `storage.mount('${m.path}', ${serializeImportName(m.driver)}(${JSON.stringify(m.opts)}))`).join('\n')}

${nitro.options.bundledStorage.length ? bundledStorageCode : ''}
`
  })
}
