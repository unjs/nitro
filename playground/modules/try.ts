export default defineNitroModule((nitro) => {
  console.log('hello from defineNitroModule');

  nitro.options.handlers.push({
    handler: './handlers/handler.ts',
    route: '/try',
  })
})
