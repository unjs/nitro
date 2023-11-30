export default defineLazyEventHandler(async () => {
  const { sum } = await importWasm(import("~/wasm/sum.wasm" as string));
  // const { sum } = await importWasm(import("../../wasm/sum.wasm" as string));
  return eventHandler(() => {
    return `2+3=${sum(2, 3)}`;
  });
});

// TODO: Extract as reusable utility once stable
async function importWasm(input: any) {
  const _input = await input;
  const _module = _input.default || _input;
  const _instance =
    typeof _module === "function"
      ? await _module({}).then((r) => r.instance || r)
      : await WebAssembly.instantiate(_module, {});
  return _instance.exports;
}
