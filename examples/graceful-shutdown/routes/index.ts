import { eventHandler } from "h3";

export default eventHandler(async () => {
  console.log("Event handler is running...");
  await new Promise((resolve) => setTimeout(resolve, 2000));
  return { message: "Response took 2 seconds" };
});
