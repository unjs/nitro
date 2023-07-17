import "#internal/nitro/virtual/polyfill";
import { nitroApp } from "../app";
import { trapUnhandledNodeErrors } from "../utils";

// @todo apply defineNitroResponse
export const localFetch = nitroApp.localFetch;

// Trap unhandled errors
trapUnhandledNodeErrors();
