export default defineEventHandler(
  (event) => `Hello ${event.context.params.name}!`
);
