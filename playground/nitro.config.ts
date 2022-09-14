import { defineNitroConfig } from '../src'

export default defineNitroConfig({
  preset: 'cloudflare',
  prerender: {
    routes: ['/']
  }
})
