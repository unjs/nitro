import { defineEventHandler } from "h3";

export default defineNitroConfig({
  handlers: [
    {
      handler: "./handlers/handler.ts",
      route: "/try2",
    }
  ],
  modules: [
    (nitro) => {
      nitro.options.devHandlers.push({
        handler: defineEventHandler(() => {
          return 'Hello'
        }),
        route: "/hello"
      })
    }
  ]
});
