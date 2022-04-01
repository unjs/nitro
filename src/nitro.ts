import { existsSync } from 'fs'
import { resolve } from 'pathe'
import { createHooks } from 'hookable'
import { createUnimport } from 'unimport'
import consola from 'consola'
import type { NitroConfig, Nitro } from './types'
import { loadOptions } from './options'

export async function createNitro (config: NitroConfig = {}): Promise<Nitro> {
  // Resolve options
  const options = await loadOptions(config)

  // Create context
  const nitro: Nitro = {
    options,
    hooks: createHooks(),
    vfs: {},
    logger: consola.withTag('nitro'),
    scannedHandlers: []
  }

  // Logger config
  if (nitro.options.logLevel !== undefined) {
    nitro.logger.level = nitro.options.logLevel
  }

  // Init hooks
  nitro.hooks.addHooks(nitro.options.hooks)

  // Public assets
  for (const dir of options.scanDirs) {
    const publicDir = resolve(dir, 'public')
    if (!existsSync(publicDir)) { continue }
    if (options.publicAssets.find(asset => asset.dir === publicDir)) {
      continue
    }
    options.publicAssets.push({ dir: publicDir } as any)
  }
  for (const asset of options.publicAssets) {
    asset.baseURL = asset.baseURL || '/'
    const isTopLevel = asset.baseURL === '/'
    asset.fallthrough = asset.fallthrough ?? isTopLevel
    asset.maxAge = asset.maxAge ?? (isTopLevel ? 0 : 60)
  }

  // Server assets
  nitro.options.serverAssets.push({
    baseName: 'server',
    dir: resolve(nitro.options.srcDir, 'assets')
  })

  if (nitro.options.autoImport) {
    nitro.unimport = createUnimport(nitro.options.autoImport)
  }

  // Dev-only storage
  if (options.dev) {
    const fsMounts = {
      root: resolve(options.rootDir),
      src: resolve(options.srcDir),
      build: resolve(options.buildDir),
      cache: resolve(options.buildDir, 'cache')
    }
    for (const p in fsMounts) {
      options.storage.mounts[p] = options.storage.mounts[p] || {
        driver: 'fs',
        driverOptions: { base: fsMounts[p] }
      }
    }
  }

  return nitro
}
