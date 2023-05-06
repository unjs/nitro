export default eventHandler(async (event) => {
  const body = await readRawBody(event);
  const body2 = await readRawBody(event);
  return {
    body,
    body2,
  };
});
