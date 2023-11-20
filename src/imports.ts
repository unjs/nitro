import type { Preset } from "unimport";

export const nitroImports: Preset[] = [
  {
    from: "#internal/nitro",
    imports: [
      "cachedEventHandler",
      "cachedFunction",
      "defineCachedEventHandler",
      "defineCachedFunction",
      "defineNitroErrorHandler",
      "defineNitroPlugin",
      "defineRenderHandler",
      "getRouteRules",
      "nitroPlugin",
      "useAppConfig",
      "useEvent",
      "useNitroApp",
      "useRuntimeConfig",
      "useStorage",
    ],
  },
];
