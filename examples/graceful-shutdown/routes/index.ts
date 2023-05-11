import { eventHandler } from "h3";

const delay = (sec: number) => new Promise(resolve => setTimeout(resolve, sec * 1000))

export default eventHandler(async () => {
  await delay(5)
  return "You will see the response first, then the shutdown process begins."
});
