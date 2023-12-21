import _mod from "~/wasm/sum.wasm";

export default eventHandler(async () => {
  const { sum } = await _mod;
  return `2+3=${sum(2, 3)}`;
});
