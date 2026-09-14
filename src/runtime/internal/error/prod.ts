import { HTTPError, type H3Event, type HTTPEvent } from "h3";
import type { InternalHandlerResponse } from "./utils.ts";
import { FastResponse } from "srvx";
import type { NitroErrorHandler } from "nitro/types";

const errorHandler: NitroErrorHandler = (error, event) => {
  const res = defaultHandler(error, event);
  return new FastResponse(
    typeof res.body === "string" ? res.body : JSON.stringify(res.body, null, 2),
    res
  );
};

export default errorHandler;

export function defaultHandler(error: HTTPError, event: HTTPEvent): InternalHandlerResponse {
  const unhandled = error.unhandled ?? !HTTPError.isError(error);
  const { status = 500, statusText = "" } = unhandled ? {} : error;

  if (status === 404) {
    const url = (event as H3Event).url || new URL(event.req.url);
    const baseURL = import.meta.baseURL || "/";
    if (/^\/[^/]/.test(baseURL) && !url.pathname.startsWith(baseURL)) {
      return {
        status: 302,
        headers: new Headers({ location: `${baseURL}${url.pathname.slice(1)}${url.search}` }),
      };
    }
  }

  // Headers staged on the event (route rules, middleware, `event.res.headers`)
  // must survive into the error response: h3 skips its staged-header merge for
  // responses returned by `onError` handlers, so error handlers have to carry
  // them over themselves (https://github.com/nitrojs/nitro/issues/4183).
  const eventHeaders = (event as H3Event).res;
  const headers = new Headers([
    ...(eventHeaders?.headers || []),
    ...(eventHeaders?.errHeaders || []),
    ...(!unhandled && error.headers ? error.headers : []),
  ]);
  headers.set("content-type", "application/json; charset=utf-8");

  const jsonBody = unhandled
    ? { status, unhandled: true }
    : typeof error.toJSON === "function"
      ? error.toJSON()
      : { status, statusText, message: error.message };

  return {
    status,
    statusText,
    headers,
    body: {
      error: true,
      ...jsonBody,
    },
  };
}
