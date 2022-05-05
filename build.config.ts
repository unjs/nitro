import { defineBuildConfig } from 'unbuild'

export default defineBuildConfig({
  declaration: true,
  entries: [
    'src/index',
    'src/cli',
    { input: 'src/runtime/', outDir: 'dist/runtime', format: 'esm' }
  ],
  dependencies: [
    '@cloudflare/kv-asset-handler',
    '@netlify/functions',
    '@nuxt/devalue',
    'destr',
    'ohmyfetch',
    'ora'
  ],
  externals: [
    '@nuxt/schema'
  ]
})
