import { defineNitroPreset } from '../preset'

export const cloudflarePages = defineNitroPreset({
  extends: 'cloudflare',
  entry: '#internal/nitro/entries/cloudflare-pages',
  commands: {
    preview: 'npx wrangler pages dev .output/public',
    deploy: 'npx wrangler pages publish .output/public'
  },
  output: {
    serverDir: '{{ rootDir }}/functions'
  },
  rollupConfig: {
    output: {
      entryFileNames: '[[path]].js',
      format: 'esm'
    }
  }
})
