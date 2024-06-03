import "#internal/nitro/virtual/polyfill";
import { toNodeListener } from "h3";
import { nitroApp } from "nitropack/runtime/app";
import { trapUnhandledNodeErrors } from "nitropack/runtime/utils";
import { startScheduleRunner } from "nitropack/runtime/task";

export const listener = toNodeListener(nitroApp.h3App);

/** @experimental */
export const websocket = import.meta._websocket
  ? nitroApp.h3App.websocket
  : undefined;

/** @deprecated use new `listener` export instead */
export const handler = listener;

// Trap unhandled errors
trapUnhandledNodeErrors();

// Scheduled tasks
if (import.meta._tasks) {
  startScheduleRunner();
}
