import { eventHandler } from "h3";

export default eventHandler(() => {
  console.log(useRuntimeConfig());
  return "<h1>Hello Nitro!</h1>";
});
