import { defineEventHandler } from "h3";

export default defineNitroConfig({
  modules: [
    (_, nitro) => {
      nitro.options.devHandlers.push({
        handler: defineEventHandler(() => {
          return 'Hello'
        }),
        route: "/hello"
      })
    }
  ]
});
