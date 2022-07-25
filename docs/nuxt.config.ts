import { defineNuxtConfig } from 'nuxt'

export default defineNuxtConfig({
  extends: ['@nuxt-themes/docus'],
  components: [
    {
      path: '~/components',
      global: true
    }
  ]
})
