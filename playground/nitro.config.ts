export default defineNitroConfig({
  routeRules: {
    '/**': {
      cache: {
        varies: ['HoST'],
      }
    }
  }
});
