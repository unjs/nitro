import "#internal/nitro/virtual/polyfill";
import { nitroApp } from "../app";
import { trapUnhandledNodeErrors } from "../utils";

export const localFetch = nitroApp.localFetch;

// Trap unhandled errors
trapUnhandledNodeErrors();
