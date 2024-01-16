export default defineNuxtConfig({
  extends: "@nuxt-themes/docus",
  modules: ["@nuxtjs/plausible", "@nuxtjs/seo"],
  routeRules: {
    "/deploy/node": { redirect: "/deploy/runtimes/node" },
  },
  nitro: {
    prerender: {
      failOnError: false,
    },
  },
  site: {
    url: 'https://nitro.unjs.io',
    name: 'Nitro',
    description: 'Nitro is an open source TypeScript framework to build ultra-fast web servers. The open engine powering Nuxt and open to everyone.',
    defaultLocale: 'en',
  },
  schemaOrg: {
    identity: 'Organization',
    name: "Nitro",
    url: 'https://nitro.unjs.io',
    logo: 'https://nitro.unjs.io/nitro.png',
  },
  seoExperiments: {
    enabled: false
  },
  linkChecker: {
    enabled: false
  }
});
