// import { pathToFileURL } from 'url'
import { dirname, join, relative, resolve } from 'pathe'
import type { InputOptions, OutputOptions } from 'rollup'
import defu from 'defu'
import devalue from '@nuxt/devalue'
import { terser } from 'rollup-plugin-terser'
import commonjs from '@rollup/plugin-commonjs'
import { nodeResolve } from '@rollup/plugin-node-resolve'
import alias from '@rollup/plugin-alias'
import json from '@rollup/plugin-json'
import replace from '@rollup/plugin-replace'
import virtual from '@rollup/plugin-virtual'
import wasmPlugin from '@rollup/plugin-wasm'
import inject from '@rollup/plugin-inject'
import { visualizer } from 'rollup-plugin-visualizer'
import * as unenv from 'unenv'
import type { Preset } from 'unenv'
import { sanitizeFilePath } from 'mlly'
import unimportPlugin from 'unimport/unplugin'
import type { Nitro } from '../types'
import { resolveAliases } from '../utils'
import { runtimeDir } from '../dirs'
import { dynamicRequire } from './plugins/dynamic-require'
import { externals } from './plugins/externals'
import { timing } from './plugins/timing'
import { publicAssets } from './plugins/public-assets'
import { serverAssets } from './plugins/server-assets'
import { handlers } from './plugins/handlers'
import { esbuild } from './plugins/esbuild'
import { raw } from './plugins/raw'
import { storage } from './plugins/storage'

export type RollupConfig = InputOptions & { output: OutputOptions }

export const getRollupConfig = (nitro: Nitro) => {
  const extensions: string[] = ['.ts', '.mjs', '.js', '.json', '.node']

  const nodePreset = nitro.options.node === false ? unenv.nodeless : unenv.node

  const builtinPreset: Preset = {
    alias: {
      // General
      debug: 'unenv/runtime/npm/debug',
      consola: 'unenv/runtime/npm/consola',
      ...nitro.options.alias
    }
  }

  const env = unenv.env(nodePreset, builtinPreset, nitro.options.unenv)

  if (nitro.options.sourceMap) {
    env.polyfill.push('source-map-support/register.js')
  }

  const buildServerDir = join(nitro.options.buildDir, 'dist/server')
  const runtimeAppDir = join(runtimeDir, 'app')

  const rollupConfig: RollupConfig = {
    input: nitro.options.entry,
    output: {
      dir: nitro.options.output.serverDir,
      entryFileNames: 'index.mjs',
      chunkFileNames (chunkInfo) {
        let prefix = ''
        const modules = Object.keys(chunkInfo.modules)
        const lastModule = modules[modules.length - 1]
        if (lastModule.startsWith(buildServerDir)) {
          prefix = join('app', relative(buildServerDir, dirname(lastModule)))
        } else if (lastModule.startsWith(runtimeAppDir)) {
          prefix = 'app'
        } else if (lastModule.startsWith(nitro.options.buildDir)) {
          prefix = 'nuxt'
        } else if (lastModule.startsWith(runtimeDir)) {
          prefix = 'nitro'
        } else if (nitro.options.handlers.find(m => lastModule.startsWith(m.handler as string))) {
          prefix = 'handlers'
        } else if (lastModule.includes('assets')) {
          prefix = 'assets'
        }
        return join('chunks', prefix, '[name].mjs')
      },
      inlineDynamicImports: nitro.options.inlineDynamicImports,
      format: 'esm',
      exports: 'auto',
      intro: '',
      outro: '',
      preferConst: true,
      sanitizeFileName: sanitizeFilePath,
      sourcemap: nitro.options.sourceMap,
      sourcemapExcludeSources: true,
      sourcemapPathTransform (relativePath, sourcemapPath) {
        return resolve(dirname(sourcemapPath), relativePath)
      }
    },
    external: env.external,
    // https://github.com/rollup/rollup/pull/4021#issuecomment-809985618
    // https://github.com/nuxt/framework/issues/160
    makeAbsoluteExternalsRelative: false,
    plugins: [],
    onwarn (warning, rollupWarn) {
      if (
        !['CIRCULAR_DEPENDENCY', 'EVAL'].includes(warning.code) &&
        !warning.message.includes('Unsupported source map comment')
      ) {
        rollupWarn(warning)
      }
    },
    treeshake: {
      moduleSideEffects (id) {
        return nitro.options.moduleSideEffects.some(match => id.startsWith(match))
      }
    }
  }

  if (nitro.options.timing) {
    rollupConfig.plugins.push(timing())
  }

  if (nitro.options.autoImport) {
    rollupConfig.plugins.push(unimportPlugin.rollup(nitro.options.autoImport))
  }

  // Raw asset loader
  rollupConfig.plugins.push(raw())

  // WASM import support
  if (nitro.options.experimental.wasm) {
    rollupConfig.plugins.push(wasmPlugin())
  }

  // https://github.com/rollup/plugins/tree/master/packages/replace
  rollupConfig.plugins.push(replace({
    // @ts-ignore https://github.com/rollup/plugins/pull/810
    preventAssignment: true,
    values: {
      'process.env.NODE_ENV': nitro.options.dev ? '"development"' : '"production"',
      'typeof window': '"undefined"',
      'global.': 'globalThis.',
      'process.server': 'true',
      'process.client': 'false',
      'process.dev': String(nitro.options.dev),
      'process.env.RUNTIME_CONFIG': devalue(nitro.options.runtimeConfig),
      'process.env.DEBUG': JSON.stringify(nitro.options.dev),
      ...nitro.options.replace
    }
  }))

  // ESBuild
  rollupConfig.plugins.push(esbuild({
    target: 'es2019',
    sourceMap: true,
    ...nitro.options.esbuild?.options
  }))

  // Dynamic Require Support
  rollupConfig.plugins.push(dynamicRequire({
    dir: resolve(nitro.options.buildDir, 'dist/server'),
    inline: nitro.options.node === false || nitro.options.inlineDynamicImports,
    ignore: [
      'client.manifest.mjs',
      'server.js',
      'server.cjs',
      'server.mjs',
      'server.manifest.mjs'
    ]
  }))

  // Server assets
  rollupConfig.plugins.push(serverAssets(nitro))

  // Public assets
  if (nitro.options.serveStatic) {
    rollupConfig.plugins.push({
      name: 'dirnames',
      renderChunk (code, chunk) {
        return {
          code: (chunk.isEntry ? 'globalThis.entryURL = import.meta.url;' : '') + code,
          map: null
        }
      }
    })
    rollupConfig.plugins.push(publicAssets(nitro))
  }

  // Storage
  rollupConfig.plugins.push(storage(nitro.options.storage))

  // Handlers
  rollupConfig.plugins.push(handlers(() => {
    const handlers = [
      ...nitro.scannedHandlers,
      ...nitro.options.handlers
    ]
    if (nitro.options.serveStatic) {
      handlers.unshift({ handler: '#nitro/static' })
    }
    if (nitro.options.renderer) {
      handlers.push({ handler: nitro.options.renderer })
    }
    return handlers
  }))

  // Polyfill
  rollupConfig.plugins.push(virtual({
    '#polyfill': env.polyfill.map(p => `import '${p}';`).join('\n')
  }))

  // https://github.com/rollup/plugins/tree/master/packages/alias
  rollupConfig.plugins.push(alias({
    entries: resolveAliases({
      '#nitro': runtimeDir,
      '#config': resolve(runtimeDir, 'config'),
      '#nitro-error': resolve(runtimeDir, 'error'),
      '#_config': resolve(runtimeDir, 'config'),
      '#paths': resolve(runtimeDir, 'paths'),
      '#cache': resolve(runtimeDir, 'cache'),
      // TODO: Fix windows issue
      '#build': nitro.options.buildDir,
      '~': nitro.options.srcDir,
      '@/': nitro.options.srcDir,
      '~~': nitro.options.rootDir,
      '@@/': nitro.options.rootDir,
      ...env.alias
    })
  }))

  // Externals Plugin
  if (nitro.options.externals) {
    rollupConfig.plugins.push(externals(defu(nitro.options.externals as any, {
      outDir: nitro.options.output.serverDir,
      moduleDirectories: nitro.options.nodeModulesDirs,
      external: [
        ...(nitro.options.dev ? [nitro.options.buildDir] : [])
      ],
      inline: [
        '#',
        '~',
        '@/',
        '~~',
        '@@/',
        'virtual:',
        runtimeDir,
        nitro.options.srcDir,
        ...nitro.options.handlers.map(m => m.handler).filter(i => typeof i === 'string'),
        // TODO: Move to Nuxt
        ...(nitro.options.dev ? [] : ['vue', '@vue/', '@nuxt/'])
      ],
      traceOptions: {
        base: '/',
        processCwd: nitro.options.rootDir,
        exportsOnly: true
      },
      exportConditions: [
        'default',
        'module',
        'node',
        'import'
      ]
    })))
  }

  // https://github.com/rollup/plugins/tree/master/packages/node-resolve
  rollupConfig.plugins.push(nodeResolve({
    extensions,
    preferBuiltins: true,
    rootDir: nitro.options.rootDir,
    moduleDirectories: nitro.options.nodeModulesDirs,
    // 'module' is intentionally not supported because of externals
    mainFields: ['main'],
    exportConditions: [
      'default',
      'module',
      'node',
      'import'
    ]
  }))

  // Automatically mock unresolved externals
  // rollupConfig.plugins.push(autoMock())

  // https://github.com/rollup/plugins/tree/master/packages/commonjs
  rollupConfig.plugins.push(commonjs({
    esmExternals: id => !id.startsWith('unenv/'),
    requireReturnsDefault: 'auto'
  }))

  // https://github.com/rollup/plugins/tree/master/packages/json
  rollupConfig.plugins.push(json())

  // https://github.com/rollup/plugins/tree/master/packages/inject
  rollupConfig.plugins.push(inject(env.inject))

  // https://github.com/TrySound/rollup-plugin-terser
  // https://github.com/terser/terser#minify-Nitro
  if (nitro.options.minify) {
    rollupConfig.plugins.push(terser({
      mangle: {
        keep_fnames: true,
        keep_classnames: true
      },
      format: {
        comments: false
      }
    }))
  }

  if (nitro.options.analyze) {
    // https://github.com/btd/rollup-plugin-visualizer
    rollupConfig.plugins.push(visualizer({
      ...nitro.options.analyze,
      filename: nitro.options.analyze.filename.replace('{name}', 'nitro'),
      title: 'Nitro Server bundle stats'
    }))
  }

  return rollupConfig
}
