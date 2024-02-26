export default defineEventHandler(() => {
  return $fetch(
    "https://raw.githubusercontent.com/unjs/crossws/main/examples/h3/public/index.html"
  );
});
