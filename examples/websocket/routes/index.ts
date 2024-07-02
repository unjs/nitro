export default defineEventHandler(async () => {
  const data = await $fetch(
    "https://raw.githubusercontent.com/unjs/crossws/main/examples/h3/public/index.html"
  );

  return data;
});
