export default defineNitroModule({
  setup: (nitro) => {
  nitro.options.handlers.push({
    handler: './handlers/handler.ts',
    route: '/an-handler',
  })
}
})
