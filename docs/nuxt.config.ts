export default defineNuxtConfig({
  extends: "@nuxt/ui-pro",

  modules: [
    '@nuxt/image',
    '@nuxt/content',
    '@nuxt/ui',
    '@nuxtjs/fontaine',
    '@nuxtjs/google-fonts',
    '@nuxtjs/plausible',
    'nuxt-og-image',
  ],

  ui: {
    icons: ['heroicons', 'simple-icons', 'ph'],
  },

  fontMetrics: {
    fonts: ['DM Sans'],
  },

  googleFonts: {
    display: 'swap',
    download: true,
    families: {
      'DM+Sans': [400, 500, 600, 700],
    },
  },

  routeRules: {
    "/deploy/node": { redirect: "/deploy/runtimes/node" },
  },

  nitro: {
    prerender: {
      routes: [
        '/api/search.json'
      ],
      failOnError: false,
    }
  },
});
