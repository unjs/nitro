import { resolve } from 'pathe'
import { createHooks } from 'hookable'
import { createUnimport } from 'unimport'
import type { NitroConfig, Nitro } from './types'
import { resolvePath } from './utils'
import { loadOptions } from './options'

export async function createNitro (config: NitroConfig = {}): Promise<Nitro> {
  // Resolve options
  const options = await loadOptions(config)

  // Create context
  const nitro: Nitro = {
    options,
    hooks: createHooks(),
    vfs: {},
    scannedHandlers: []
  }

  // Init hooks
  nitro.hooks.addHooks(nitro.options.hooks)

  // Resolve output dir
  options.output.dir = resolvePath(nitro, nitro.options.output.dir)
  options.output.publicDir = resolvePath(nitro, nitro.options.output.publicDir)
  options.output.serverDir = resolvePath(nitro, nitro.options.output.serverDir)

  // Dev-only storage
  if (nitro.options.dev) {
    const fsMounts = {
      root: resolve(nitro.options.rootDir),
      src: resolve(nitro.options.srcDir),
      build: resolve(nitro.options.buildDir),
      cache: resolve(nitro.options.rootDir, 'node_modules/.nitro/cache')
    }
    for (const p in fsMounts) {
      nitro.options.storage.mounts[p] = nitro.options.storage.mounts[p] || {
        driver: 'fs',
        driverOptions: { base: fsMounts[p] }
      }
    }
  }

  // Assets
  nitro.options.assets.dirs.server = {
    dir: resolve(nitro.options.srcDir, 'server/assets'), meta: true
  }

  if (nitro.options.autoImport) {
    nitro.unimport = createUnimport(nitro.options.autoImport)
  }

  return nitro
}
