import { runtimeDir } from "nitropack/runtime/meta";
import type { NitroOptions } from "nitropack/types";
import { join } from "pathe";

export async function resolveOpenAPIOptions(options: NitroOptions) {
  // Check if the experimental.openAPI option is enabled
  if (!options.experimental.openAPI) {
    return;
  }

  // Add openapi json route
  if (options.dev || options.openAPI?.production) {
    const shouldPrerender = !options.dev && options.openAPI?.production === 'prerender';
    const route = options.openAPI?.route || "/_nitro/openapi.json"
    options.handlers.push({
      route,
      handler: join(runtimeDir, "internal/routes/openapi"),
      env: shouldPrerender ? 'prerender' : undefined /* runtime */
    });
    if (shouldPrerender) {
      options.prerender ??= {} as any;
      options.prerender.routes ??= [];
      options.prerender.routes.push(route);
    }
  }

  // Add /_nitro/scalar and /_nitro/swagger routes in dev mode
  if (options.dev) {
    options.handlers.push({
      route: options.openAPI?.ui?.scalar?.route || "/_nitro/scalar",
      handler: join(runtimeDir, "internal/routes/scalar"),
    });
    options.handlers.push({
      route: options.openAPI?.ui?.swagger?.route ?? "/_nitro/swagger",
      handler: join(runtimeDir, "internal/routes/swagger"),
    });
  }
}
