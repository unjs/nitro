export default defineLazyEventHandler(async () => {
  const { sum } = await import("~/wasm/sum.wasm");
  return eventHandler(() => {
    return `2+3=${sum(2, 3)}`;
  });
});
