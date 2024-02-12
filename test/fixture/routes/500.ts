export default defineEventHandler((event) => {
  throw createError({ statusCode: 500, statusMessage: "Test Error" });
});
