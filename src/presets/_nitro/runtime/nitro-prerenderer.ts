import "#internal/nitro/virtual/polyfill";
import { nitroApp } from "nitropack/runtime/app";
import { trapUnhandledNodeErrors } from "nitropack/runtime/utils";

export const localFetch = nitroApp.localFetch;
export const closePrerenderer = () => nitroApp.hooks.callHook("close");

// Trap unhandled errors
trapUnhandledNodeErrors();
