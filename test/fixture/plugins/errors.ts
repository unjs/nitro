export const allErrors = [];

export default defineNitroPlugin((app) => {
  app.hooks.hook("error", (error, context) => {
    allErrors.push({ error, context });
  });
});
