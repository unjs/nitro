import { existsSync } from 'fs'
import { resolve } from 'pathe'
import { createHooks, createDebugger } from 'hookable'
import { createUnimport } from 'unimport'
import consola from 'consola'
import type { NitroConfig, Nitro } from './types'
import { loadOptions } from './options'
import { scanPlugins } from './scan'
import { createStorage } from './storage'

export async function createNitro (config: NitroConfig = {}): Promise<Nitro> {
  // Resolve options
  const options = await loadOptions(config)

  // Create context
  const nitro: Nitro = {
    options,
    hooks: createHooks(),
    vfs: {},
    logger: consola.withTag('nitro'),
    scannedHandlers: [],
    close: () => nitro.hooks.callHook('close'),
    storage: undefined
  }

  // Storage
  nitro.storage = await createStorage(nitro)
  nitro.hooks.hook('close', async () => { await nitro.storage.dispose() })

  if (nitro.options.debug) {
    createDebugger(nitro.hooks, { tag: 'nitro' })
    nitro.options.plugins.push('#internal/nitro/debug')
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

  // Plugins
  const scannedPlugins = await scanPlugins(nitro)
  for (const plugin of scannedPlugins) {
    if (!nitro.options.plugins.find(p => p === plugin)) {
      nitro.options.plugins.push(plugin)
    }
  }

  if (nitro.options.imports) {
    nitro.unimport = createUnimport(nitro.options.imports)
    // Support for importing from '#imports'
    nitro.options.virtual['#imports'] = () => nitro.unimport.toExports()
    // Backward compatibility
    nitro.options.virtual['#nitro'] = 'export * from "#imports"'
  }

  return nitro
}
