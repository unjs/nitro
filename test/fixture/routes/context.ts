export default defineEventHandler(async () => {
  await Promise.resolve(setTimeout(() => {}, 10));
  return await useTest();
});

function useTest() {
  return {
    context: {
      path: useEvent().path,
    },
  };
}
