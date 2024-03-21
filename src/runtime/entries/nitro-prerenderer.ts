import "#internal/nitro/virtual/polyfill";
import { nitroApp } from "../app";
import { trapUnhandledNodeErrors } from "../utils";

export const localFetch = nitroApp.localFetch;
export const closePrerenderer = () => nitroApp.hooks.callHook("close");

// Trap unhandled errors
trapUnhandledNodeErrors();
