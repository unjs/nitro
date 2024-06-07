// Backward compatibility for imports from "#internal/nitro/*" or "nitropack/runtime/*"

export {
  cachedEventHandler,
  cachedFunction,
  defineCachedEventHandler,
  defineCachedFunction,
} from "./internal/cache";
