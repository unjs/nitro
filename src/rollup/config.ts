// import { pathToFileURL } from 'url'
import { createRequire } from 'module'
import { dirname, join, relative, resolve } from 'pathe'
import type { InputOptions, OutputOptions } from 'rollup'
import defu from 'defu'
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
import { resolvePath } from '../utils'
import { runtimeDir } from '../dirs'
import { dynamicRequire } from './plugins/dynamic-require'
import { externals } from './plugins/externals'
import { timing } from './plugins/timing'
// import { autoMock } from './plugins/automock'
import { staticAssets, dirnames } from './plugins/static'
import { assets } from './plugins/assets'
import { middleware } from './plugins/middleware'
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
      // Vue 2
      encoding: 'unenv/runtime/mock/proxy',
      he: 'unenv/runtime/mock/proxy',
      resolve: 'unenv/runtime/mock/proxy',
      'source-map': 'unenv/runtime/mock/proxy',
      'lodash.template': 'unenv/runtime/mock/proxy',
      'serialize-javascript': 'unenv/runtime/mock/proxy',
      // Vue 3
      'estree-walker': 'unenv/runtime/mock/proxy',
      '@babel/parser': 'unenv/runtime/mock/proxy',
      '@vue/compiler-core': 'unenv/runtime/mock/proxy',
      '@vue/compiler-dom': 'unenv/runtime/mock/proxy',
      '@vue/compiler-ssr': 'unenv/runtime/mock/proxy',
      '@vue/devtools-api': 'unenv/runtime/mock/proxy',
      ...nitro.options.alias
    }
  }

  const env = unenv.env(nodePreset, builtinPreset, nitro.options.unenv)

  if (nitro.options.sourceMap) {
    env.polyfill.push('source-map-support/register.js')
  }

  // TODO: #590
  try {
    const _require = createRequire(import.meta.url)
    env.alias['vue/server-renderer'] = 'vue/server-renderer'
    env.alias['vue/compiler-sfc'] = 'vue/compiler-sfc'
    env.alias.vue = _require.resolve(`vue/dist/vue.cjs${nitro.options.dev ? '' : '.prod'}.js`)
  } catch (_err) {
    // Ignore when vue not installed
  }

  const buildServerDir = join(nitro.options.buildDir, 'dist/server')
  const runtimeAppDir = join(runtimeDir, 'app')

  const rollupConfig: RollupConfig = {
    input: resolvePath(nitro, nitro.options.entry),
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
        } else if (nitro.options.middleware.find(m => lastModule.startsWith(m.handle as string))) {
          prefix = 'middleware'
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
  if (nitro.options.experiments.wasm) {
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
      // 'process.env.NUXT_NO_SSR': JSON.stringify(!nitro.options.ssr),
      'process.env.ROUTER_BASE': JSON.stringify(nitro.options.routerBase),
      'process.env.PUBLIC_PATH': JSON.stringify(nitro.options.publicPath),
      // 'process.env.NUXT_STATIC_BASE': JSON.stringify(nitro.options.staticAssets.base),
      // 'process.env.NUXT_STATIC_VERSION': JSON.stringify(nitro.options.staticAssets.version),
      // 'process.env.NUXT_FULL_STATIC': nitro.options.fullStatic as unknown as string,
      // 'process.env.NITRO_PRESET': JSON.stringify(nitro.options.preset),
      'process.env.RUNTIME_CONFIG': JSON.stringify(nitro.options.runtimeConfig),
      'process.env.DEBUG': JSON.stringify(nitro.options.dev)
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

  // Assets
  rollupConfig.plugins.push(assets(nitro.options.assets))

  // Static
  // TODO: use assets plugin
  if (nitro.options.serveStatic) {
    rollupConfig.plugins.push(dirnames())
    rollupConfig.plugins.push(staticAssets(nitro))
  }

  // Storage
  rollupConfig.plugins.push(storage(nitro.options.storage))

  // Middleware
  rollupConfig.plugins.push(middleware(() => {
    const _middleware = [
      ...nitro.scannedMiddleware,
      ...nitro.options.middleware
    ]
    if (nitro.options.serveStatic) {
      _middleware.unshift({ route: '/', handle: '#nitro/static' })
    }
    if (nitro.options.renderer) {
      _middleware.push({ route: '/', handle: nitro.options.renderer })
    }
    return _middleware
  }))

  // Polyfill
  rollupConfig.plugins.push(virtual({
    '#polyfill': env.polyfill.map(p => `import '${p}';`).join('\n')
  }))

  // https://github.com/rollup/plugins/tree/master/packages/alias
  rollupConfig.plugins.push(alias({
    entries: {
      '#nitro': runtimeDir,
      '#config': resolve(runtimeDir, 'config'),
      '#paths': resolve(runtimeDir, 'paths'),
      '#cache': resolve(runtimeDir, 'cache'),
      '#nitro-renderer': resolve(runtimeDir, 'vue/vue3'),
      // TODO: Fix windows issue
      '#build': nitro.options.buildDir,
      '~': nitro.options.srcDir,
      '@/': nitro.options.srcDir,
      '~~': nitro.options.rootDir,
      '@@/': nitro.options.rootDir,
      ...env.alias
    }
  }))

  // Externals Plugin
  if (nitro.options.externals) {
    rollupConfig.plugins.push(externals(defu(nitro.options.externals as any, {
      outDir: nitro.options.output.serverDir,
      moduleDirectories: nitro.options.modulesDir,
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
        nitro.options.rootDir,
        nitro.options.srcDir,
        ...nitro.options.middleware.map(m => m.handle),
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
    moduleDirectories: nitro.options.modulesDir,
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
