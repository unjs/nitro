import { defineNitroConfig } from '../src'

export default defineNitroConfig({
  renderer: './app',
  prerender: {
    crawlLinks: true
  },
  routes: {
    '/api/swr': { swr: true }
  }
})
