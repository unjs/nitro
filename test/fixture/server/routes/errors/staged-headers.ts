import { defineHandler, handleCors, HTTPError } from "nitro/h3";

export default defineHandler((event) => {
  handleCors(event, { origin: "*" });
  event.res.headers.set("x-success-only", "true");
  throw new HTTPError({
    status: 401,
    message: "unauthorized",
  });
});
