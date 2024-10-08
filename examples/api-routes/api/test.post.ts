export default defineEventHandler(async () => {
  const body = await readBody(event);
  return {
    message: "Test post handler",
    body,
  };
});
