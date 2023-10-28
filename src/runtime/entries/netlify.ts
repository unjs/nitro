import "#internal/nitro/virtual/polyfill";
import type { Handler } from "@netlify/functions/dist/main";
import { lambda } from "./netlify-lambda";

export const handler: Handler = function handler(event, context) {
  return lambda(event, context);
};
