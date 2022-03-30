import { defineNitroConfig } from '../src'

export default defineNitroConfig({
  prerender: {
    routes: [
      '/api/test',
      '/api/cache'
    ]
  }
})
