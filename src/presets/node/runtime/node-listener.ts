import "#nitro-internal-pollyfills";
import { toNodeListener } from "h3";
import { useNitroApp } from "nitropack/runtime";
import { trapUnhandledNodeErrors } from "nitropack/runtime/internal/utils";
import { startScheduleRunner } from "nitropack/runtime/internal/task";

const nitroApp = useNitroApp();

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
