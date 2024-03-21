export default eventHandler(async (event) => {
  const md = await import("../../assets/test.md" as string).then(
    (r) => r.default
  );
  return md;
});
