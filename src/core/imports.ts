import type { Preset } from "unimport";

export const nitroImports: Preset[] = [
  {
    from: "nitropack/runtime",
    imports: [
      "defineCachedFunction",
      "defineCachedEventHandler",
      "cachedFunction",
      "cachedEventHandler",
      "useRuntimeConfig",
      "useStorage",
      "useNitroApp",
      "defineNitroPlugin",
      "nitroPlugin",
      "defineRenderHandler",
      "defineRouteMeta",
      "getRouteRules",
      "useAppConfig",
      "useEvent",
      "defineTask",
      "runTask",
      "defineNitroErrorHandler",
    ],
  },
];
