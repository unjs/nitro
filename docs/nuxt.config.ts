export default defineNuxtConfig({
  extends: "@nuxt-themes/docus",
  modules: ["@nuxtjs/plausible"],
  routeRules: {
    "/deploy/node": { redirect: "/deploy/runtimes/node" },
  },
  nitro: {
    prerender: {
      failOnError: false,
    },
  },
});
