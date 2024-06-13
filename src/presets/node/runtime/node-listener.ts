import "#nitro-internal-pollyfills";
import { toNodeListener } from "h3";
import { useNitroApp } from "nitro/runtime";
import { startScheduleRunner } from "nitro/runtime/internal/task";
import { trapUnhandledNodeErrors } from "nitro/runtime/internal/utils";

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
