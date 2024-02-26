export default eventHandler(async (event) => {
  const name = getRouterParam(event, "name");
  const payload = { ...getQuery(event) };
  const { result } = await runTask(name, payload);
  return {
    name,
    payload,
    result,
  };
});
