import type { NitroErrorHandler } from "nitropack";

export default <NitroErrorHandler>function (error, event) {
  event.res.end("[custom error handler] " + error.stack);
};
