import type { H3Event } from "h3";

export type CapturedErrorContext = {
  event?: H3Event;
  [key: string]: unknown;
};

export type CaptureError = (
  error: Error,
  context: CapturedErrorContext
) => void;
