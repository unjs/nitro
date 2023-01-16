import { eventHandler } from "h3";

import { defineNitroPlugin } from "./plugin";

const globalTiming = globalThis.__timing__ || {
  start: () => 0,
  end: () => 0,
  metrics: [],
};

// https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Server-Timing
const timingMiddleware = eventHandler((event) => {
  const start = globalTiming.start();

  const _end = event.node.res.end;
  event.node.res.end = function (
    chunk: any,
    encoding: BufferEncoding,
    cb?: () => void
  ) {
    const metrics = [
      ["Generate", globalTiming.end(start)],
      ...globalTiming.metrics,
    ];
    const serverTiming = metrics
      .map((m) => `-;dur=${m[1]};desc="${encodeURIComponent(m[0])}"`)
      .join(", ");
    if (!event.node.res.headersSent) {
      event.node.res.setHeader("Server-Timing", serverTiming);
    }
    _end.call(event.node.res, chunk, encoding, cb);
    return this;
  }.bind(event.node.res);
});

export default defineNitroPlugin((nitro) => {
  // Always add timing middleware to the beginning of handler stack
  nitro.h3App.stack.unshift({
    route: "/",
    handler: timingMiddleware,
  });
});
