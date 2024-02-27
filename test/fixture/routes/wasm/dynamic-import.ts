export default defineLazyEventHandler(async () => {
  // @ts-ignore
  const { sum } = await import("unwasm/examples/sum.wasm").then((r) =>
    r.default()
  );
  return eventHandler(() => {
    return `2+3=${sum(2, 3)}`;
  });
});
