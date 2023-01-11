import { defineNuxtConfig } from 'nuxt'

export default defineNuxtConfig({
  extends: '@nuxt-themes/docus',
  app: {
    head: {
      title: '⚗️ Nitro'
    }
  },
  routeRules: {
    '/deploy/providers/layer0': { redirect: '/deploy/providers/edgio' }
  }
})
