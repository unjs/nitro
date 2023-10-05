import { defineEventHandler } from "h3";
import { Nitro } from "nitropack";

export default (nitro: Nitro) => {
  nitro.options.devHandlers.push({
    handler: defineEventHandler(() => {
      return 'simple dev handler'
    }),
    route: "/simple-dev-handler"
  })
}
