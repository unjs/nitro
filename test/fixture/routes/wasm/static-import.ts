// @ts-ignore
import init, { sum } from "unwasm/examples/sum.wasm";

export default defineLazyEventHandler(async () => {
  await init();
  return eventHandler(() => {
    return `2+3=${sum(2, 3)}`;
  });
});
