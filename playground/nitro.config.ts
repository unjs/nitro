export default defineNitroConfig({
  experimental: {
    openAPI: true,
  },
  openAPI: {
    meta: {
      title: 'Foobar',
      description: 'Foobar API',
      version: '2.0',
    },
    ui: {
      scalar: {
        theme: 'purple'
      }
    }
  },
});
