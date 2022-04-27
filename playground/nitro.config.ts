import { defineNitroConfig } from '../src'

export default defineNitroConfig({
  bundledStorage: [
    '/cache'
  ],
  prerender: {
    routes: [
      '/'
    ]
  }
})
