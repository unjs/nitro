import type { Handler } from "aws-lambda";
import "#internal/nitro/virtual/polyfill";
import { nitroApp } from "../app";

interface StormkitEvent {
  url: string; // e.g. /my/path, /my/path?with=query
  path: string;
  method: string;
  body?: string;
  query?: Record<string, Array<string>>;
  headers?: Record<string, string>;
  rawHeaders?: Array<string>;
}

export interface StormkitResult {
  statusCode: number;
  headers?: { [header: string]: boolean | number | string } | undefined;
  body?: string | undefined;
}

export const handler: Handler<StormkitEvent, StormkitResult> = async function (
  event,
  context
) {
  const method = event.method || "get";

  const r = await nitroApp.localCall({
    event,
    url: event.url,
    context,
    headers: event.headers, // TODO: Normalize headers
    method,
    query: event.query,
    body: event.body,
  });

  // TODO: Handle cookies with lambda v1 or v2 ?
  return {
    statusCode: r.status,
    headers: normalizeOutgoingHeaders(r.headers),
    body: r.body.toString(),
  };
};

function normalizeOutgoingHeaders(
  headers: Record<string, string | string[] | undefined>
) {
  return Object.fromEntries(
    Object.entries(headers).map(([k, v]) => [
      k,
      Array.isArray(v) ? v.join(",") : v!,
    ])
  );
}
