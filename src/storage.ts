import { createStorage as _createStorage } from 'unstorage'
import type { Nitro } from './types'

export const builtinDrivers = {
  fs: 'unstorage/drivers/fs',
  http: 'unstorage/drivers/http',
  memory: 'unstorage/drivers/memory',
  redis: 'unstorage/drivers/redis',
  'cloudflare-kv': 'unstorage/drivers/cloudflare-kv'
}

export async function createStorage (nitro: Nitro) {
  const storage = _createStorage()

  const mounts = {
    ...nitro.options.storage,
    ...nitro.options.devStorage
  }

  for (const [path, opts] of Object.entries(mounts)) {
    const driver = await import(builtinDrivers[opts.driver] || opts.driver)
      .then(r => r.default || r)
    storage.mount(path, driver(opts))
  }

  return storage
}

export async function snapshotStorage (nitro: Nitro) {
  const storage = await createStorage(nitro)
  const data: Record<string, any> = {}

  const allKeys = Array.from(new Set(await Promise.all(
    nitro.options.bundledStorage.map(base => storage.getKeys(base))
  ).then(r => r.flat())))

  await Promise.all(allKeys.map(async (key) => {
    data[key] = await storage.getItem(key)
  }))

  await storage.dispose()

  return data
}
