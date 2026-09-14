import { defineHandler, HTTPError } from "nitro/h3";

// Reproduces https://github.com/nitrojs/nitro/issues/4183: a handler stages
// response headers (e.g. CORS headers written by middleware onto
// `event.res.headers`) and then throws; the error response must not drop them.
export default defineHandler((event) => {
  event.res.headers.set("x-staged-header", "staged-value");
  event.res.headers.set("access-control-allow-origin", "https://example.com");
  throw new HTTPError({
    status: 401,
    message: "unauthorized",
  });
});
