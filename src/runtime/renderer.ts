import { H3Event, eventHandler, setResponseStatus } from "h3";
import { useNitroApp } from "./app";

export interface RenderResponse {
  body: string;
  statusCode: number;
  statusMessage: string;
  headers: Record<string, string>;
}

export type RenderHandler = (
  event: H3Event
) => Partial<RenderResponse> | Promise<Partial<RenderResponse>>;

export function defineRenderHandler(handler: RenderHandler) {
  return eventHandler(async (event) => {
    // TODO: Use serve-placeholder
    if (event.node.req.url.endsWith("/favicon.ico")) {
      if (!event.handled) {
        event.node.res.setHeader("Content-Type", "image/x-icon");
        event.node.res.end(
          "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7"
        );
      }
      return;
    }

    const response = await handler(event);
    if (!response) {
      if (!event.handled) {
        event.node.res.statusCode =
          event.node.res.statusCode === 200 ? 500 : event.node.res.statusCode;
        event.node.res.end(
          "No response returned from render handler: " + event.node.req.url
        );
      }
      return;
    }

    // Allow hooking and modifying response
    const nitroApp = useNitroApp();
    await nitroApp.hooks.callHook("render:response", response, { event });

    // TODO: Warn if response is already handled

    // TODO: Caching support

    // Send headers
    if (!event.node.res.headersSent && response.headers) {
      for (const header in response.headers) {
        event.node.res.setHeader(header, response.headers[header]);
      }
      setResponseStatus(event, response.statusCode, response.statusMessage);
    }

    // Send response body
    return typeof response.body === "string"
      ? response.body
      : JSON.stringify(response.body);
  });
}
