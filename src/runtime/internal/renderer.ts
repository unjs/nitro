import {
  H3Event,
  eventHandler,
  getResponseStatus,
  send,
  setResponseHeader,
  setResponseHeaders,
  setResponseStatus,
} from "h3";
import type { RenderHandler } from "nitro/types";
import { useNitroApp } from "./app";
import { useRuntimeConfig } from "./config";

export function defineRenderHandler(handler: RenderHandler) {
  const runtimeConfig = useRuntimeConfig();
  return eventHandler(async (event) => {
    // TODO: Use serve-placeholder
    if (event.path === `${runtimeConfig.app.baseURL}favicon.ico`) {
      setResponseHeader(event, "Content-Type", "image/x-icon");
      return send(
        event,
        "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7"
      );
    }

    const response = await handler(event);
    if (!response) {
      const _currentStatus = getResponseStatus(event);
      setResponseStatus(event, _currentStatus === 200 ? 500 : _currentStatus);
      return send(
        event,
        "No response returned from render handler: " + event.path
      );
    }

    // Allow hooking and modifying response
    const nitroApp = useNitroApp();
    await nitroApp.hooks.callHook("render:response", response, { event });

    // TODO: Warn if response is already handled

    // TODO: Caching support

    // Send headers
    if (response.headers) {
      setResponseHeaders(event, response.headers);
    }
    if (response.statusCode || response.statusMessage) {
      setResponseStatus(event, response.statusCode, response.statusMessage);
    }

    // Send response body
    return response.body;
  });
}
