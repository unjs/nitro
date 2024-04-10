export default eventHandler(async (event) => {
  return {
    stack: new Error("testing error").stack.replace(/\\/g, "/"),
  };
});
