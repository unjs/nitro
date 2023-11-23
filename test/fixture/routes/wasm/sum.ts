export default defineLazyEventHandler(async () => {
  // @ts-ignore
  const { sum } = await import("~/wasm/sum.wasm")
    .then((wasm) => wasm.default({}))
    .then((r) => r.instance.exports);

  // @ts-ignore
  // const { sum } = await import("~/wasm/sum.wasm")
  //   .then((mod) => WebAssembly.instantiate(mod.default, {}))
  //   .then((instance) => instance.exports);

  return eventHandler((event) => {
    return `2+3=${sum(2, 3)}`;
  });
});
