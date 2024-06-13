import "#nitro-internal-pollyfills";
import { useNitroApp } from "nitropack/runtime";
import { trapUnhandledNodeErrors } from "nitropack/runtime/internal";

const nitroApp = useNitroApp();

export const localFetch = nitroApp.localFetch;
export const closePrerenderer = () => nitroApp.hooks.callHook("close");

// Trap unhandled errors
trapUnhandledNodeErrors();
