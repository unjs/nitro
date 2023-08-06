export default defineNitroConfig({
  routeRules: {
    "/**": { cache: { varies: ["host"] } },
  },
});
