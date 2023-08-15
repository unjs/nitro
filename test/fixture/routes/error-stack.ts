// eslint-disable-next-line require-await
export default eventHandler(async (event) => {
  return {
    stack: new Error("testing error").stack,
  };
});
