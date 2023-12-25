import { eventHandler } from "h3"

export default (nitroApp) => {
  nitroApp.h3App.stack.unshift({
      route: '/manual-module/module-plugin',
      handler: eventHandler(() => {
          return JSON.stringify('injected by a module specified by the user')
      })
    })
  }
