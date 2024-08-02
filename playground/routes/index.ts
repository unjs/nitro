export default eventHandler(async (event) => {
  // 15 seconds from now
  const runAt = new Date(Date.now() + 15 * 1000);

  return await runTask("test", {}, {
    runAt
  });
});
