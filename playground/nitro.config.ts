import { defineNitroConfig } from '../src'

export default defineNitroConfig({
  prerender: {
    routes: [
      '/api/vue',
      '/api/test'
    ]
  }
})
