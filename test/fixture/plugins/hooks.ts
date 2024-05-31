export default defineNitroPlugin((app) => {
  app.hooks.hook("request", (event) => {
    if (event.path.startsWith("/hooks")) {
      const qs = getQuery(event);
      switch (qs.change) {
        case "useAppConfig": {
          useAppConfig(event).dynamic = "from-hook";
          break;
        }
        case "useRuntimeConfig": {
          useRuntimeConfig(event).dynamic = "from-hook";
          break;
        }
      }
    }
  });
});
