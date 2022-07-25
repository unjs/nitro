import { defineNuxtConfig } from 'nuxt'

export default defineNuxtConfig({
  app: {
    head: {
      title: '⚗️ Nitro'
    }
  },
  extends: ['@nuxt-themes/docus'],
  components: [
    {
      path: '~/components',
      global: true
    }
  ]
})
