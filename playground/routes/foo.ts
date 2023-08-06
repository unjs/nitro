// eslint-disable-next-line require-await
export default eventHandler(async (event) => {
  return {
    headers: event.headers.entries(),
  };
});
