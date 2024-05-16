import "#internal/nitro/virtual/polyfill";
import { nitroApp } from "#internal/nitro/app";
import { trapUnhandledNodeErrors } from "#internal/nitro/utils";

export const localFetch = nitroApp.localFetch;
export const closePrerenderer = () => nitroApp.hooks.callHook("close");

// Trap unhandled errors
trapUnhandledNodeErrors();
